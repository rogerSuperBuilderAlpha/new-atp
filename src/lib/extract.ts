import { generateText, Output } from "ai";
import { LabelFieldsSchema, type LabelFields } from "@/lib/schema";

const EXTRACTION_SYSTEM_PROMPT = `You are assisting TTB alcohol label compliance agents.
Extract only text visible on the label image. Do not invent missing values.
Return null for fields that are absent or not readable.
Preserve casing and punctuation exactly where possible, especially for GOVERNMENT WARNING text.
If the label has glare, blur, distortion, or an angled photo, still extract what you can and mention uncertainty in imageQualityNotes.`;

const EXTRACTION_USER_PROMPT = `Read this alcohol beverage label and extract:
- brand name
- class/type designation
- alcohol content
- net contents
- bottler/producer/importer name and address
- country of origin
- the full Government Health Warning statement
- the most likely beverage category (spirits, wine, beer, or other) based on class/type wording and alcohol strength
- any other useful text

Focus on compliance review. Preserve exact warning-statement wording and capitalization.`;

export async function extractLabelFromImage(
  image: Uint8Array,
  mediaType: string,
): Promise<LabelFields> {
  const model = process.env.AI_GATEWAY_MODEL ?? "openai/gpt-5.5";

  const { output } = await generateText({
    model,
    system: EXTRACTION_SYSTEM_PROMPT,
    output: Output.object({ schema: LabelFieldsSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: EXTRACTION_USER_PROMPT },
          {
            type: "image",
            image,
            mediaType,
            providerOptions: {
              openai: { imageDetail: "low" },
            },
          },
        ],
      },
    ],
  });

  return output;
}
