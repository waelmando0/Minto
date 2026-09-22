/*
 * Passwordless sign-in: request a one-time code by email, then verify it.
 *
 * This is a mock of the API the website's login dialog also targets. Swap the
 * bodies of `requestCode` and `verifyCode` for real requests to your auth
 * provider; the screens only depend on these signatures.
 */

export const CODE_LENGTH = 6;
/** Fixed code the mock accepts; the verify screen shows it as a demo hint. */
export const DEMO_CODE = "246810";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address, like you@example.com.";
  return undefined;
}

export interface Session {
  token: string;
  email: string;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function requestCode(email: string, { delay = 600 } = {}): Promise<void> {
  const error = validateEmail(email);
  if (error) throw new Error(error);
  await wait(delay);
}

export async function verifyCode(email: string, code: string, { delay = 600 } = {}): Promise<Session> {
  await wait(delay);
  if (code.length !== CODE_LENGTH) throw new Error(`Enter the ${CODE_LENGTH}-digit code.`);
  if (code !== DEMO_CODE) throw new Error("That code doesn't match. Check your email and try again.");
  return { token: `mock-${Date.now()}`, email: email.trim().toLowerCase() };
}
