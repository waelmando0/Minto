import { DEMO_CODE, requestCode, validateEmail, verifyCode } from "@/lib/auth";

describe("validateEmail", () => {
  it("requires a well-formed address", () => {
    expect(validateEmail("")).toBe("Enter your email address.");
    expect(validateEmail("rafael@")).toMatch(/valid email/);
    expect(validateEmail("  rafael@minto.app ")).toBeUndefined();
  });
});

describe("mock sign-in API", () => {
  it("rejects a code request for an invalid email", async () => {
    await expect(requestCode("nope", { delay: 0 })).rejects.toThrow(/valid email/);
  });

  it("rejects short and wrong codes", async () => {
    await expect(verifyCode("a@b.co", "123", { delay: 0 })).rejects.toThrow(/6-digit/);
    await expect(verifyCode("a@b.co", "111111", { delay: 0 })).rejects.toThrow(/doesn't match/);
  });

  it("returns a session with a normalised email for the right code", async () => {
    const session = await verifyCode(" Rafael@Minto.app ", DEMO_CODE, { delay: 0 });
    expect(session.email).toBe("rafael@minto.app");
    expect(session.token).toMatch(/^mock-/);
  });
});
