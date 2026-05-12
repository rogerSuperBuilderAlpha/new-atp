import { describe, expect, it } from "vitest";
import { checkCompliance } from "@/lib/compliance";
import { STANDARD_GOVERNMENT_WARNING, type LabelFields } from "@/lib/schema";

const baseFields: LabelFields = {
  brandName: "OLD TOM DISTILLERY",
  classType: "Kentucky Straight Bourbon Whiskey",
  alcoholContent: "45% Alc./Vol. (90 Proof)",
  netContents: "750 mL",
  producerNameAddress: "Bottled by Old Tom Distillery, Louisville, KY",
  countryOfOrigin: "United States",
  governmentWarning: STANDARD_GOVERNMENT_WARNING,
  detectedBeverageType: "spirits",
  additionalText: [],
  confidence: 0.96,
  imageQualityNotes: [],
};

function check(fields: Partial<LabelFields>, id: string) {
  const result = checkCompliance({ ...baseFields, ...fields }, fields.detectedBeverageType ?? "spirits").find(
    (item) => item.id === id,
  );

  if (!result) throw new Error(`Missing check ${id}.`);
  return result;
}

describe("checkCompliance", () => {
  it("passes required spirits fields and standard checks", () => {
    const checks = checkCompliance(baseFields, "spirits");

    expect(checks.every((item) => item.status === "pass")).toBe(true);
  });

  it("flags missing required spirits fields", () => {
    const result = check({ producerNameAddress: null }, "required-producerNameAddress");

    expect(result.status).toBe("fail");
  });

  it("treats missing beer alcohol content as an agent-review warning", () => {
    const result = checkCompliance({ ...baseFields, alcoholContent: null }, "beer").find(
      (item) => item.id === "alcohol-content",
    );

    expect(result?.status).toBe("warning");
  });

  it("fails malformed government warning wording", () => {
    const result = check(
      {
        governmentWarning:
          "GOVERNMENT WARNING: Drinking alcohol may be dangerous during pregnancy.",
      },
      "government-warning",
    );

    expect(result.status).toBe("fail");
  });

  it("warns when image quality notes mention glare despite high confidence", () => {
    const result = check({ imageQualityNotes: ["Readable, but glare crosses fine print."] }, "image-quality");

    expect(result.status).toBe("warning");
  });

  it("fails very low extraction confidence", () => {
    const result = check({ confidence: 0.4 }, "image-quality");

    expect(result.status).toBe("fail");
  });
});
