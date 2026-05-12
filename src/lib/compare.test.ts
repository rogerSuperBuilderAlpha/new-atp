import { describe, expect, it } from "vitest";
import { compareFields } from "@/lib/compare";
import { STANDARD_GOVERNMENT_WARNING, type ExpectedFields, type LabelFields } from "@/lib/schema";

const baseActual: LabelFields = {
  brandName: "OLD TOM DISTILLERY",
  classType: "Kentucky Straight Bourbon Whiskey",
  alcoholContent: "45% Alc./Vol. (90 Proof)",
  netContents: "750 mL",
  producerNameAddress: "Bottled by Old Tom Distillery, Louisville, KY",
  countryOfOrigin: "United States",
  governmentWarning: STANDARD_GOVERNMENT_WARNING,
  detectedBeverageType: "spirits",
  additionalText: [],
  confidence: 0.98,
  imageQualityNotes: [],
};

function verdictFor(expected: ExpectedFields, actual: Partial<LabelFields>, field: string) {
  const verdict = compareFields(expected, { ...baseActual, ...actual }).find(
    (item) => item.field === field,
  );

  if (!verdict) throw new Error(`Missing verdict for ${field}.`);
  return verdict;
}

describe("compareFields", () => {
  it("passes exact field matches", () => {
    const verdict = verdictFor({ brandName: "OLD TOM DISTILLERY" }, {}, "brandName");

    expect(verdict.status).toBe("pass");
  });

  it("downgrades formatting-only differences to warnings", () => {
    const verdict = verdictFor(
      { brandName: "Stone's Throw" },
      { brandName: "STONE'S THROW" },
      "brandName",
    );

    expect(verdict.status).toBe("warning");
    expect(verdict.reason).toMatch(/capitalization|punctuation|spacing/i);
  });

  it("warns when alcohol content is equivalent with different wording", () => {
    const verdict = verdictFor(
      { alcoholContent: "45% Alc./Vol. (90 Proof)" },
      { alcoholContent: "45% ABV / 90 proof" },
      "alcoholContent",
    );

    expect(verdict.status).toBe("warning");
  });

  it("fails when an expected field is not readable", () => {
    const verdict = verdictFor({ netContents: "750 mL" }, { netContents: null }, "netContents");

    expect(verdict.status).toBe("fail");
  });

  it("fails government warning text with a non-uppercase heading", () => {
    const verdict = verdictFor(
      { governmentWarning: STANDARD_GOVERNMENT_WARNING },
      {
        governmentWarning: STANDARD_GOVERNMENT_WARNING.replace(
          "GOVERNMENT WARNING:",
          "Government Warning:",
        ),
      },
      "governmentWarning",
    );

    expect(verdict.status).toBe("fail");
    expect(verdict.reason).toMatch(/all caps/i);
  });
});
