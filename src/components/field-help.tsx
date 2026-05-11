export const expectedFieldHelp: Record<string, { title: string; body: string }> = {
  brandName: {
    title: "Brand name",
    body: "The trade name under which the product is marketed. It must appear on the brand label in a prominent position. Examples: \"OLD TOM DISTILLERY\", \"Stags' Leap Winery\".",
  },
  classType: {
    title: "Class / type designation",
    body: "The product's regulated category as defined in 27 CFR Parts 4, 5, and 7. Examples: \"Kentucky Straight Bourbon Whiskey\", \"Chardonnay\", \"Ale\". Generic terms like \"liquor\" or \"alcohol\" are not sufficient.",
  },
  alcoholContent: {
    title: "Alcohol content",
    body: "Required for distilled spirits and most wine. Must be expressed as a percentage of alcohol by volume, for example \"45% Alc./Vol.\" Proof may be added in parentheses for spirits, e.g. \"(90 Proof)\".",
  },
  netContents: {
    title: "Net contents",
    body: "Volume of product in the container. TTB requires standard metric units such as \"750 mL\" or \"1.75 L\". US fluid ounces are accepted on beer labels.",
  },
  producerNameAddress: {
    title: "Producer / bottler / importer",
    body: "The name and address of the responsible party. The wording typically begins with \"Bottled by\", \"Produced by\", \"Imported by\", or similar. City and state are required; street address is optional in most cases.",
  },
  countryOfOrigin: {
    title: "Country of origin",
    body: "Required on imported products. Domestic products do not need this field, but many labels still include it.",
  },
  governmentWarning: {
    title: "Government Health Warning",
    body: "The mandatory statement defined in 27 CFR Part 16. The heading must read exactly \"GOVERNMENT WARNING:\" in capital letters, immediately followed by the two-part statutory text without paraphrasing.",
  },
};

export const complianceSectionHelp = {
  title: "TTB compliance checks",
  body: "Automated checks that mirror items on the standard agent review checklist. Each check produces pass, warning, or fail and links to a short explanation. Warnings indicate items that an agent should confirm; failures indicate items that would normally require resubmission.",
};

export const applicationFieldHelp = {
  title: "Application field comparison",
  body: "Compares values you supplied from the COLA application against text the model extracted from the label. Case-only or punctuation-only differences are flagged as warnings rather than failures.",
};

export const beverageTypeHelp = {
  title: "Beverage type",
  body: "Determines which TTB rules apply (for example, alcohol-content reporting is required for spirits but optional for some beer). The app classifies the beverage automatically from the label. You can override this if the application's category differs.",
};

export const optionalCsvHelp = {
  title: "Expected fields CSV",
  body: "Optional. Provide one row per label with the values from the COLA application; the app will compare each label against its row. If you skip the CSV, every uploaded image is run through the compliance checklist on its own.",
};
