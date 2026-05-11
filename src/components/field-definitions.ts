import { STANDARD_GOVERNMENT_WARNING } from "@/lib/schema";

export const beverageOptions = [
  { value: "spirits", label: "Distilled spirits" },
  { value: "wine", label: "Wine" },
  { value: "beer", label: "Beer" },
  { value: "other", label: "Other" },
];

export const expectedFieldDefinitions = [
  {
    key: "brandName",
    label: "Brand name",
    placeholder: "OLD TOM DISTILLERY",
  },
  {
    key: "classType",
    label: "Class/type",
    placeholder: "Kentucky Straight Bourbon Whiskey",
  },
  {
    key: "alcoholContent",
    label: "Alcohol content",
    placeholder: "45% Alc./Vol. (90 Proof)",
  },
  {
    key: "netContents",
    label: "Net contents",
    placeholder: "750 mL",
  },
  {
    key: "producerNameAddress",
    label: "Producer / bottler / importer",
    placeholder: "Bottled by Old Tom Distillery, Louisville, KY",
  },
  {
    key: "countryOfOrigin",
    label: "Country of origin",
    placeholder: "United States",
  },
  {
    key: "governmentWarning",
    label: "Government Warning",
    placeholder: STANDARD_GOVERNMENT_WARNING,
  },
] as const;
