import { STANDARD_GOVERNMENT_WARNING, type ExpectedFields } from "@/lib/schema";

export const sampleExpectedFields: ExpectedFields = {
  beverageType: "spirits",
  brandName: "OLD TOM DISTILLERY",
  classType: "Kentucky Straight Bourbon Whiskey",
  alcoholContent: "45% Alc./Vol. (90 Proof)",
  netContents: "750 mL",
  producerNameAddress: "Bottled by Old Tom Distillery, Louisville, KY",
  countryOfOrigin: "United States",
  governmentWarning: STANDARD_GOVERNMENT_WARNING,
};

export async function loadSampleLabel() {
  const response = await fetch("/samples/old-tom-clean.png");

  if (!response.ok) {
    throw new Error("Unable to load sample label.");
  }

  const blob = await response.blob();

  return new File([blob], "old-tom-clean.png", { type: "image/png" });
}
