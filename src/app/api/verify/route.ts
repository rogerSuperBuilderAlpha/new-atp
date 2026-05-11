import { buildVerificationResult } from "@/lib/compare";
import { extractLabelFromImage } from "@/lib/extract";
import { errorResponse, readExpectedFields, readImageFromFormData } from "@/lib/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const expected = readExpectedFields(formData);
    const image = await readImageFromFormData(formData);
    const extracted = await extractLabelFromImage(image.buffer, image.mediaType);
    const result = buildVerificationResult(expected, extracted);

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
