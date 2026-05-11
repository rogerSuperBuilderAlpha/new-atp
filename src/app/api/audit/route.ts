import { checkCompliance } from "@/lib/compliance";
import { summarize } from "@/lib/compare";
import { extractLabelFromImage } from "@/lib/extract";
import { errorResponse, readImageFromFormData } from "@/lib/server";
import { beverageTypes, type BeverageType } from "@/lib/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = await readImageFromFormData(formData);
    const beverageTypeValue = formData.get("beverageType");
    const beverageType: BeverageType =
      typeof beverageTypeValue === "string" &&
      beverageTypes.includes(beverageTypeValue as BeverageType)
        ? (beverageTypeValue as BeverageType)
        : "spirits";

    const extracted = await extractLabelFromImage(image.buffer, image.mediaType);
    const complianceChecks = checkCompliance(extracted, beverageType);

    return Response.json({
      extracted,
      complianceChecks,
      summary: summarize(complianceChecks),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
