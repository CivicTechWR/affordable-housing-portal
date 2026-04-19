import { updateListingSchema } from "@/shared/schemas/listings";

describe("updateListingSchema", () => {
  it("rejects effectively empty nested updates", () => {
    const cases = [
      { payload: { address: {} }, message: "Address update must include at least one field." },
      {
        payload: { eligibilityCriteria: {} },
        message: "Eligibility criteria update must include at least one field.",
      },
      { payload: { contact: {} }, message: "Contact update must include at least one field." },
      { payload: { units: [{}] }, message: "Each unit update must include at least one field." },
    ];

    cases.forEach(({ payload, message }) => {
      const result = updateListingSchema.safeParse(payload);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues.map((issue) => issue.message)).toContain(message);
      }
    });
  });

  it("accepts meaningful nested updates", () => {
    const result = updateListingSchema.safeParse({
      address: { city: "Waterloo" },
      contact: { email: "leasing@example.com" },
      eligibilityCriteria: { minAge: 55 },
      units: [{ rent: 1800 }],
    });

    expect(result.success).toBe(true);
  });
});
