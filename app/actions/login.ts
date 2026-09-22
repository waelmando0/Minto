"use server";

import { validateEmail, type LoginState } from "@/lib/login";

export async function requestMagicLink(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const error = validateEmail(email);

  if (error) {
    return { status: "error", message: error, email };
  }

  // Integration point: hand the address to your auth provider's magic-link / OTP flow here.
  console.info("[login] magic link requested", { email });

  return { status: "success", email };
}
