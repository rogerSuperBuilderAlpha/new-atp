import Papa from "papaparse";
import { ExpectedFieldsSchema, type BatchRow, type VerificationResult } from "@/lib/schema";

export const csvHeaders = [
  "rowId",
  "imageFile",
  "beverageType",
  "brandName",
  "classType",
  "alcoholContent",
  "netContents",
  "producerNameAddress",
  "countryOfOrigin",
  "governmentWarning",
];

export function parseBatchCsv(csvText: string): BatchRow[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors.map((error) => error.message).join("; "));
  }

  return parsed.data.map((row, index) => {
    const expected = ExpectedFieldsSchema.parse({
      brandName: row.brandName,
      classType: row.classType,
      alcoholContent: row.alcoholContent,
      netContents: row.netContents,
      producerNameAddress: row.producerNameAddress,
      countryOfOrigin: row.countryOfOrigin,
      governmentWarning: row.governmentWarning,
      beverageType: row.beverageType || "spirits",
    });

    if (!row.imageFile) {
      throw new Error(`Row ${index + 1} is missing imageFile.`);
    }

    return {
      ...expected,
      rowId: row.rowId || String(index + 1),
      imageFile: row.imageFile,
    };
  });
}

export function batchTemplateCsv() {
  return Papa.unparse([
    {
      rowId: "1",
      imageFile: "old-tom-clean.png",
      beverageType: "spirits",
      brandName: "OLD TOM DISTILLERY",
      classType: "Kentucky Straight Bourbon Whiskey",
      alcoholContent: "45% Alc./Vol. (90 Proof)",
      netContents: "750 mL",
      producerNameAddress: "Bottled by Old Tom Distillery, Louisville, KY",
      countryOfOrigin: "United States",
      governmentWarning:
        "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.",
    },
  ]);
}

export function resultsToCsv(
  rows: Array<{
    rowId: string;
    imageFile: string;
    result?: VerificationResult;
    error?: string;
  }>,
) {
  return Papa.unparse(
    rows.map((row) => ({
      rowId: row.rowId,
      imageFile: row.imageFile,
      status: row.result?.summary.status ?? "error",
      pass: row.result?.summary.pass ?? 0,
      warning: row.result?.summary.warning ?? 0,
      fail: row.result?.summary.fail ?? 0,
      unknown: row.result?.summary.unknown ?? 0,
      extractedBrandName: row.result?.extracted.brandName ?? "",
      extractedAlcoholContent: row.result?.extracted.alcoholContent ?? "",
      error: row.error ?? "",
    })),
  );
}
