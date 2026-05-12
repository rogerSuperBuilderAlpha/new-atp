import { describe, expect, it } from "vitest";
import { readExpectedFields } from "@/lib/server";

describe("readExpectedFields", () => {
  it("returns no comparison fields for compliance-only payloads", () => {
    const formData = new FormData();
    formData.set("expected", "{}");

    expect(readExpectedFields(formData)).toEqual({});
  });

  it("does not infer a Government Warning value when expected fields are hidden", () => {
    const formData = new FormData();
    formData.set("expected", JSON.stringify({ brandName: "Sarah's Reserve" }));

    expect(readExpectedFields(formData)).toEqual({ brandName: "Sarah's Reserve" });
  });
});
