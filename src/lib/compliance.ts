import {
  STANDARD_GOVERNMENT_WARNING,
  type BeverageType,
  type ComplianceCheck,
  type LabelFields,
  type VerdictStatus,
} from "@/lib/schema";
import { extractAbv, hasRequiredWarningHeader, normalizeWarning } from "@/lib/compare";

const requiredByBeverage: Record<BeverageType, Array<keyof LabelFields>> = {
  spirits: [
    "brandName",
    "classType",
    "alcoholContent",
    "netContents",
    "producerNameAddress",
    "governmentWarning",
  ],
  wine: [
    "brandName",
    "classType",
    "alcoholContent",
    "netContents",
    "producerNameAddress",
    "governmentWarning",
  ],
  beer: ["brandName", "classType", "netContents", "producerNameAddress", "governmentWarning"],
  other: ["brandName", "classType", "netContents", "governmentWarning"],
};

const labels: Record<keyof LabelFields, string> = {
  brandName: "Brand name",
  classType: "Class/type",
  alcoholContent: "Alcohol content",
  netContents: "Net contents",
  producerNameAddress: "Producer / bottler / importer",
  countryOfOrigin: "Country of origin",
  governmentWarning: "Government Warning",
  additionalText: "Additional text",
  confidence: "Extraction confidence",
  imageQualityNotes: "Image quality",
};

export function checkCompliance(
  fields: LabelFields,
  beverageType: BeverageType = "spirits",
): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];

  for (const field of requiredByBeverage[beverageType]) {
    checks.push({
      id: `required-${field}`,
      label: `${labels[field]} present`,
      status: hasText(fields[field]) ? "pass" : "fail",
      reason: hasText(fields[field])
        ? `${labels[field]} was found on the label.`
        : `${labels[field]} is required for ${beverageType} labels and was not found.`,
    });
  }

  checks.push(checkGovernmentWarning(fields.governmentWarning));
  checks.push(checkAlcoholContent(fields.alcoholContent, beverageType));
  checks.push(checkNetContents(fields.netContents));
  checks.push(checkConfidence(fields.confidence, fields.imageQualityNotes));

  return checks;
}

function checkGovernmentWarning(value: string | null): ComplianceCheck {
  if (!hasText(value)) {
    return check(
      "government-warning",
      "Government Warning exact text",
      "fail",
      "The mandatory Government Health Warning statement was not found.",
    );
  }

  if (!hasRequiredWarningHeader(value)) {
    return check(
      "government-warning",
      "Government Warning exact text",
      "fail",
      'The warning heading must be exactly "GOVERNMENT WARNING:" in all caps.',
    );
  }

  if (normalizeWarning(value) !== normalizeWarning(STANDARD_GOVERNMENT_WARNING)) {
    return check(
      "government-warning",
      "Government Warning exact text",
      "fail",
      "The warning statement wording differs from the required statutory text.",
    );
  }

  return check(
    "government-warning",
    "Government Warning exact text",
    "pass",
    "The warning heading and statutory text are correct.",
  );
}

function checkAlcoholContent(value: string | null, beverageType: BeverageType): ComplianceCheck {
  if (beverageType === "beer" && !hasText(value)) {
    return check(
      "alcohol-content",
      "Alcohol content format",
      "warning",
      "Alcohol content is sometimes optional for beer, but agents should confirm the application type.",
    );
  }

  if (!hasText(value)) {
    return check(
      "alcohol-content",
      "Alcohol content format",
      beverageType === "other" ? "warning" : "fail",
      "Alcohol content was not readable on the label.",
    );
  }

  const abv = extractAbv(value);
  if (abv === null) {
    return check(
      "alcohol-content",
      "Alcohol content format",
      "fail",
      "Alcohol content should include a clear ABV statement such as 45% Alc./Vol.",
    );
  }

  if (abv <= 0 || abv > 95) {
    return check(
      "alcohol-content",
      "Alcohol content format",
      "warning",
      `ABV value ${abv}% is unusual and should be reviewed by an agent.`,
    );
  }

  return check(
    "alcohol-content",
    "Alcohol content format",
    "pass",
    `Alcohol content includes a readable ABV value (${abv}%).`,
  );
}

function checkNetContents(value: string | null): ComplianceCheck {
  if (!hasText(value)) {
    return check("net-contents", "Net contents format", "fail", "Net contents were not found.");
  }

  if (!/\b\d+(?:\.\d+)?\s*(ml|mL|l|L|liter|liters|oz|fl\.?\s*oz)\b/.test(value)) {
    return check(
      "net-contents",
      "Net contents format",
      "warning",
      "Net contents were found, but the unit format should be reviewed.",
    );
  }

  return check("net-contents", "Net contents format", "pass", "Net contents are readable.");
}

const qualityProblemPattern =
  /\b(blur|blurr|glare|angle|angled|rotat|skew|tilt|partial|obscur|obstruct|crop|low[\s-]?resolut|illegible|unclear|hard to read|hard-to-read|uncertain|caveat|cut[\s-]?off|distort|wash(ed)?[\s-]?out|reflect|warp|fold|crease)\b/i;

function checkConfidence(confidence: number, notes: string[]): ComplianceCheck {
  const problemNotes = notes.filter((note) => qualityProblemPattern.test(note));

  if (confidence < 0.55) {
    return check(
      "image-quality",
      "Image readability",
      "fail",
      "The image appears too difficult to read reliably. Request a clearer label image.",
    );
  }

  if (confidence < 0.85 || problemNotes.length > 0) {
    return check(
      "image-quality",
      "Image readability",
      "warning",
      problemNotes.length > 0
        ? `Image is readable with caveats: ${problemNotes.join("; ")}.`
        : "Image is readable, but extraction confidence is moderate.",
    );
  }

  return check("image-quality", "Image readability", "pass", "Image quality is sufficient.");
}

function check(
  id: string,
  label: string,
  status: VerdictStatus,
  reason: string,
): ComplianceCheck {
  return { id, label, status, reason };
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
