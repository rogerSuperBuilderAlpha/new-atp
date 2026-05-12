import { ExpectedFieldsSchema } from "@/lib/schema";
import { PublicError, assertImageSize, assertSupportedImage } from "@/lib/limits";

export async function readImageFromFormData(formData: FormData, key = "image") {
  const file = formData.get(key);

  if (!(file instanceof File)) {
    throw new PublicError(`Missing image file field "${key}".`);
  }

  assertSupportedImage(file);
  assertImageSize(file);

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
    try {
      const parsed = ExpectedFieldsSchema.safeParse(JSON.parse(rawExpected));
      if (!parsed.success) throw new PublicError("Expected fields contain an invalid value.");
      return parsed.data;
    } catch (error) {
      if (error instanceof PublicError) throw error;
      throw new PublicError("Expected fields must be valid JSON.");
    }
  }

  const parsed = ExpectedFieldsSchema.safeParse({
    brandName: formData.get("brandName"),
    classType: formData.get("classType"),
    alcoholContent: formData.get("alcoholContent"),
    netContents: formData.get("netContents"),
    producerNameAddress: formData.get("producerNameAddress"),
    countryOfOrigin: formData.get("countryOfOrigin"),
    governmentWarning: formData.get("governmentWarning"),
    beverageType: formData.get("beverageType") || undefined,
  });

  if (!parsed.success) {
    throw new PublicError("Expected fields contain an invalid value.");
  }

  return parsed.data;
}

export function errorResponse(error: unknown, status = 400) {
  if (error instanceof PublicError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return Response.json({ error: "Unable to process the label. Try again or use a clearer image." }, { status });
}
