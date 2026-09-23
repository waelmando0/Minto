export interface LoginState {
  status: "idle" | "error" | "success";
  message?: string;
  email?: string;
}

export const initialLoginState: LoginState = { status: "idle" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shared by the Server Action and the client so both reject the same input. */
export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address, like you@example.com.";
  return undefined;
}

/** Supabase email codes are 6 digits by default; projects can raise it to 10. */
const CODE_PATTERN = /^\d{6,10}$/;

export function normalizeCode(value: string) {
  return value.replace(/\s+/g, "");
}

export function validateCode(value: string): string | undefined {
  const code = normalizeCode(value);
  if (!code) return "Enter the code from the email.";
  if (!CODE_PATTERN.test(code)) return "The code is the 6-digit number in the email.";
  return undefined;
}

const NETWORK_ERROR = /failed to fetch|fetch failed|network|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i;

/** Turns a Supabase Auth error into a message for the sign-in form. */
export function authErrorMessage(error: { message?: string; code?: string; status?: number }) {
  const message = error.message ?? "";
  if (error.code === "otp_expired" || /expired|invalid/i.test(message)) {
    return "That code is wrong or has expired. Check the latest email or send a new code.";
  }
  if (error.status === 429 || error.code === "over_email_send_rate_limit" || /rate limit|security purposes/i.test(message)) {
    return "Too many attempts. Wait a minute, then try again.";
  }
  if (NETWORK_ERROR.test(message)) return "Couldn't reach Minto. Check your connection and try again.";
  return message || "Something went wrong. Try again.";
}
