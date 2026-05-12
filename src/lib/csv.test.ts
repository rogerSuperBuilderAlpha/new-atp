import { describe, expect, it } from "vitest";
import { batchTemplateCsv, parseBatchCsv, resultsToCsv } from "@/lib/csv";
import { STANDARD_GOVERNMENT_WARNING, type VerificationResult } from "@/lib/schema";

describe("parseBatchCsv", () => {
  it("parses the downloadable template", () => {
    const rows = parseBatchCsv(batchTemplateCsv());

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      rowId: "1",
      imageFile: "old-tom-clean.png",
      beverageType: "spirits",
      brandName: "OLD TOM DISTILLERY",
    });
  });

  it("requires imageFile", () => {
    expect(() => parseBatchCsv("rowId,imageFile,brandName\n1,,OLD TOM")).toThrow(/imageFile/);
  });

  it("rejects invalid beverage types", () => {
    expect(() =>
      parseBatchCsv("rowId,imageFile,beverageType,brandName\n1,label.png,mezcal,OLD TOM"),
    ).toThrow(/Invalid CSV row/);
  });
});

describe("resultsToCsv", () => {
  it("escapes values that spreadsheet apps could treat as formulas", () => {
    const result: VerificationResult = {
      extracted: {
        brandName: "=HYPERLINK(\"https://example.test\")",
        classType: "Bourbon",
        alcoholContent: "+45% ABV",
        netContents: "750 mL",
        producerNameAddress: "Bottled by Old Tom",
        countryOfOrigin: "United States",
        governmentWarning: STANDARD_GOVERNMENT_WARNING,
        detectedBeverageType: "spirits",
        additionalText: [],
        confidence: 0.9,
        imageQualityNotes: [],
      },
      fieldVerdicts: [],
      complianceChecks: [],
      summary: { status: "warning", pass: 1, warning: 1, fail: 0, unknown: 0 },
    };

    const csv = resultsToCsv([
      {
        rowId: "1",
        imageFile: "@label.png",
        result,
        error: "-provider detail",
      },
    ]);

    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'+45% ABV");
    expect(csv).toContain("'@label.png");
    expect(csv).toContain("'-provider detail");
  });
});
