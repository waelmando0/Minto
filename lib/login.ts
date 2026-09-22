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
