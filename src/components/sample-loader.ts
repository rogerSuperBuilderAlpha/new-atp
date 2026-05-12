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

export const sampleLabels = {
  clean: {
    label: "Clean pass sample",
    filename: "old-tom-clean.png",
    expected: sampleExpectedFields,
  },
  casing: {
    label: "Formatting warning sample",
    filename: "stones-throw-casing.png",
    expected: {
      beverageType: "spirits",
      brandName: "Stone's Throw",
      classType: "American Single Malt Whiskey",
      alcoholContent: "46% Alc./Vol. (92 Proof)",
      netContents: "750 mL",
      producerNameAddress: "Bottled by Stone's Throw Spirits, Portland, OR",
      countryOfOrigin: "United States",
      governmentWarning: STANDARD_GOVERNMENT_WARNING,
    },
  },
  badWarning: {
    label: "Bad warning fail sample",
    filename: "bad-warning.png",
    expected: {
      beverageType: "wine",
      brandName: "RIVER RED",
      classType: "California Red Wine",
      alcoholContent: "13.8% Alc./Vol.",
      netContents: "750 mL",
      producerNameAddress: "Produced and bottled by River Red Winery, Napa, CA",
      countryOfOrigin: "United States",
      governmentWarning: STANDARD_GOVERNMENT_WARNING,
    },
  },
  angled: {
    label: "Glare / angle sample",
    filename: "angled-photo.png",
    expected: {
      beverageType: "beer",
      brandName: "HARBOR LIGHT",
      classType: "Imported Lager Beer",
      alcoholContent: "5.2% Alc./Vol.",
      netContents: "12 FL OZ",
      producerNameAddress: "Imported by Harbor Light Imports, Seattle, WA",
      countryOfOrigin: "Germany",
      governmentWarning: STANDARD_GOVERNMENT_WARNING,
    },
  },
} satisfies Record<string, { label: string; filename: string; expected: ExpectedFields }>;

export type SampleKey = keyof typeof sampleLabels;

export async function loadSampleLabel(sampleKey: SampleKey = "clean") {
  const sample = sampleLabels[sampleKey];
  const response = await fetch(`/samples/${sample.filename}`);

  if (!response.ok) {
    throw new Error("Unable to load sample label.");
  }

  const blob = await response.blob();

  return new File([blob], sample.filename, { type: "image/png" });
}
