import { z } from "zod";

export const beverageTypes = ["spirits", "wine", "beer", "other"] as const;

export const verdictStatuses = ["pass", "warning", "fail", "unknown"] as const;

export const STANDARD_GOVERNMENT_WARNING =
  "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.";

export const LabelFieldsSchema = z.object({
  brandName: z.string().nullable().describe("Brand name as printed on the label."),
  classType: z
    .string()
    .nullable()
    .describe("Class or type designation, such as Kentucky Straight Bourbon Whiskey."),
  alcoholContent: z
    .string()
    .nullable()
    .describe("Alcohol content statement, including ABV and proof if visible."),
  netContents: z.string().nullable().describe("Net contents such as 750 mL."),
  producerNameAddress: z
    .string()
    .nullable()
    .describe("Bottler, producer, importer, or responsible party name and address."),
  countryOfOrigin: z.string().nullable().describe("Country of origin if visible."),
  governmentWarning: z
    .string()
    .nullable()
    .describe("Full Government Health Warning statement exactly as visible."),
  detectedBeverageType: z
    .enum(beverageTypes)
    .nullable()
    .describe(
      'Best classification of the beverage based on visible class/type, ABV, and proof. Use "spirits" for distilled spirits/liquor, "wine" for wine/champagne/cider above 7% ABV, "beer" for beer/ale/malt beverages, or "other" if the category is genuinely unclear.',
    ),
  additionalText: z
    .array(z.string())
    .describe("Other notable label text not covered by the named fields."),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Overall confidence that the image was readable and fields were extracted correctly."),
  imageQualityNotes: z
    .array(z.string())
    .describe("Short notes about glare, blur, angle, or unreadable regions."),
});

export const ExpectedFieldsSchema = z.object({
  brandName: z.string().optional(),
  classType: z.string().optional(),
  alcoholContent: z.string().optional(),
  netContents: z.string().optional(),
  producerNameAddress: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  governmentWarning: z.string().optional(),
  beverageType: z.enum(beverageTypes).optional(),
});

export const FieldVerdictSchema = z.object({
  field: z.string(),
  label: z.string(),
  expected: z.string().nullable(),
  actual: z.string().nullable(),
  status: z.enum(verdictStatuses),
  reason: z.string(),
});

export const ComplianceCheckSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(verdictStatuses),
  reason: z.string(),
});

export type BeverageType = (typeof beverageTypes)[number];
export type VerdictStatus = (typeof verdictStatuses)[number];
export type LabelFields = z.infer<typeof LabelFieldsSchema>;
export type ExpectedFields = z.infer<typeof ExpectedFieldsSchema>;
export type FieldVerdict = z.infer<typeof FieldVerdictSchema>;
export type ComplianceCheck = z.infer<typeof ComplianceCheckSchema>;

export type VerificationResult = {
  extracted: LabelFields;
  fieldVerdicts: FieldVerdict[];
  complianceChecks: ComplianceCheck[];
  summary: {
    status: VerdictStatus;
    pass: number;
    warning: number;
    fail: number;
    unknown: number;
  };
};

export type BatchRow = ExpectedFields & {
  rowId: string;
  imageFile: string;
};
