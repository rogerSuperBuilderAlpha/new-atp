import {
  STANDARD_GOVERNMENT_WARNING,
  type ComplianceCheck,
  type ExpectedFields,
  type FieldVerdict,
  type LabelFields,
  type VerdictStatus,
  type VerificationResult,
} from "@/lib/schema";
import { checkCompliance } from "@/lib/compliance";

const comparableFields: Array<{
  key: keyof ExpectedFields & keyof LabelFields;
  label: string;
}> = [
  { key: "brandName", label: "Brand name" },
  { key: "classType", label: "Class/type" },
  { key: "alcoholContent", label: "Alcohol content" },
  { key: "netContents", label: "Net contents" },
  { key: "producerNameAddress", label: "Producer / bottler / importer" },
  { key: "countryOfOrigin", label: "Country of origin" },
  { key: "governmentWarning", label: "Government warning" },
];

export function compareFields(
  expected: ExpectedFields,
  actual: LabelFields,
): FieldVerdict[] {
  return comparableFields
    .filter(({ key }) => hasValue(expected[key]))
    .map(({ key, label }) => {
      const expectedValue = clean(expected[key]);
      const actualValue = clean(actual[key]);

      if (!expectedValue) {
        return verdict(key, label, null, actualValue, "unknown", "No expected value provided.");
      }

      if (!actualValue) {
        return verdict(
          key,
          label,
          expectedValue,
          null,
          "fail",
          `${label} was expected but was not readable on the label.`,
        );
      }

      if (key === "governmentWarning") {
        return compareGovernmentWarning(expectedValue, actualValue, label);
      }

      if (normalizeWhitespace(expectedValue) === normalizeWhitespace(actualValue)) {
        return verdict(key, label, expectedValue, actualValue, "pass", `${label} matches.`);
      }

      if (normalizeForFormatting(expectedValue) === normalizeForFormatting(actualValue)) {
        return verdict(
          key,
          label,
          expectedValue,
          actualValue,
          "warning",
          `${label} appears to match, but capitalization, punctuation, or spacing differs.`,
        );
      }

      if (key === "alcoholContent" && compareAlcohol(expectedValue, actualValue)) {
        return verdict(
          key,
          label,
          expectedValue,
          actualValue,
          "warning",
          "Alcohol content appears equivalent, but the wording or proof/ABV formatting differs.",
        );
      }

      if (
        (key === "producerNameAddress" || key === "classType") &&
        containsCaseInsensitive(actualValue, expectedValue)
      ) {
        return verdict(
          key,
          label,
          expectedValue,
          actualValue,
          "warning",
          key === "producerNameAddress"
            ? "Label includes the expected producer text plus extra trailing content (often a country line)."
            : "Label includes the expected class/type plus an additional qualifier word.",
        );
      }

      return verdict(
        key,
        label,
        expectedValue,
        actualValue,
        "fail",
        `${label} does not match the application value.`,
      );
    });
}

export function buildVerificationResult(
  expected: ExpectedFields,
  extracted: LabelFields,
): VerificationResult {
  const fieldVerdicts = compareFields(expected, extracted);
  const beverageType =
    expected.beverageType ?? extracted.detectedBeverageType ?? "spirits";
  const complianceChecks = checkCompliance(extracted, beverageType);
  const summary = summarize([...fieldVerdicts, ...complianceChecks]);

  return {
    extracted,
    fieldVerdicts,
    complianceChecks,
    summary,
  };
}

export function summarize(items: Array<FieldVerdict | ComplianceCheck>) {
  const counts = {
    pass: 0,
    warning: 0,
    fail: 0,
    unknown: 0,
  };

  for (const item of items) {
    counts[item.status] += 1;
  }

  const status: VerdictStatus =
    counts.fail > 0 ? "fail" : counts.warning > 0 || counts.unknown > 0 ? "warning" : "pass";

  return {
    status,
    ...counts,
  };
}

function compareGovernmentWarning(
  expected: string,
  actual: string,
  label: string,
): FieldVerdict {
  const expectedNorm = normalizeWarning(expected);
  const actualNorm = normalizeWarning(actual);

  if (expectedNorm === actualNorm && hasRequiredWarningHeader(actual)) {
    return verdict(
      "governmentWarning",
      label,
      expected,
      actual,
      "pass",
      "Government Warning text and required all-caps heading match.",
    );
  }

  if (expectedNorm === actualNorm && !hasRequiredWarningHeader(actual)) {
    return verdict(
      "governmentWarning",
      label,
      expected,
      actual,
      "fail",
      'Warning text matches, but the heading must appear as "GOVERNMENT WARNING:" in all caps.',
    );
  }

  const standardNorm = normalizeWarning(STANDARD_GOVERNMENT_WARNING);
  if (actualNorm === standardNorm && hasRequiredWarningHeader(actual)) {
    return verdict(
      "governmentWarning",
      label,
      expected,
      actual,
      "warning",
      "Label uses the standard statutory warning, but it differs from the expected application text.",
    );
  }

  return verdict(
    "governmentWarning",
    label,
    expected,
    actual,
    "fail",
    "Government Warning must match the statutory text exactly apart from whitespace and line breaks.",
  );
}

function compareAlcohol(expected: string, actual: string) {
  const expectedAbv = extractAbv(expected);
  const actualAbv = extractAbv(actual);
  const expectedProof = extractProof(expected);
  const actualProof = extractProof(actual);

  return (
    expectedAbv !== null &&
    actualAbv !== null &&
    Math.abs(expectedAbv - actualAbv) < 0.05 &&
    (expectedProof === null || actualProof === null || Math.abs(expectedProof - actualProof) < 0.1)
  );
}

export function extractAbv(value: string) {
  const match = value.match(/(\d+(?:\.\d+)?)\s*%?\s*(?:alc\.?\/vol\.?|abv|alcohol by volume)/i);
  return match ? Number(match[1]) : null;
}

export function extractProof(value: string) {
  const match = value.match(/(\d+(?:\.\d+)?)\s*proof/i);
  return match ? Number(match[1]) : null;
}

function verdict(
  field: string,
  label: string,
  expected: string | null,
  actual: string | null,
  status: VerdictStatus,
  reason: string,
): FieldVerdict {
  return { field, label, expected, actual, status, reason };
}

function hasValue(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function clean(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function containsCaseInsensitive(haystack: string, needle: string) {
  return normalizeWhitespace(haystack).toLocaleLowerCase().includes(
    normalizeWhitespace(needle).toLocaleLowerCase(),
  );
}

export function normalizeForFormatting(value: string) {
  return normalizeWhitespace(value)
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}%]+/gu, "");
}

export function normalizeWarning(value: string) {
  return normalizeWhitespace(value)
    .replace(/\s+([:;,.])/g, "$1")
    .toLocaleLowerCase();
}

export function hasRequiredWarningHeader(value: string) {
  return normalizeWhitespace(value).startsWith("GOVERNMENT WARNING:");
}
