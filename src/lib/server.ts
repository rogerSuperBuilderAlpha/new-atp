import { ExpectedFieldsSchema } from "@/lib/schema";

export async function readImageFromFormData(formData: FormData, key = "image") {
  const file = formData.get(key);

  if (!(file instanceof File)) {
    throw new Error(`Missing image file field "${key}".`);
  }

  const supportedTypes = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

  if (!supportedTypes.has(file.type)) {
    throw new Error(
      `${file.name || "Uploaded file"} must be a PNG, JPEG, GIF, or WEBP image.`,
    );
  }

  const buffer = new Uint8Array(await file.arrayBuffer());

  return {
    buffer,
    mediaType: file.type,
    name: file.name,
  };
}

export function readExpectedFields(formData: FormData) {
  const rawExpected = formData.get("expected");

  if (typeof rawExpected === "string" && rawExpected.trim().length > 0) {
    return ExpectedFieldsSchema.parse(JSON.parse(rawExpected));
  }

  return ExpectedFieldsSchema.parse({
    brandName: formData.get("brandName"),
    classType: formData.get("classType"),
    alcoholContent: formData.get("alcoholContent"),
    netContents: formData.get("netContents"),
    producerNameAddress: formData.get("producerNameAddress"),
    countryOfOrigin: formData.get("countryOfOrigin"),
    governmentWarning: formData.get("governmentWarning"),
    beverageType: formData.get("beverageType") || undefined,
  });
}

export function errorResponse(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Something went wrong.";

  return Response.json({ error: message }, { status });
}
