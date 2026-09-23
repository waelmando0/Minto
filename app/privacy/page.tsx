import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal-page";
import { mintoMeta } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Minto collects, why, who processes it, and how to delete your account.",
  alternates: { canonical: "/privacy" },
};

const email = mintoMeta.contactEmail;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="September 23, 2026"
      intro={
        <p>
          This policy explains what the Minto app and website collect, why, who processes it for us, and the choices
          you have. We collect only what Minto needs to work, and we never sell your data.
        </p>
      }
    >
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Your email address.</strong> You sign in with a one-time code sent to your email. We use it to sign
            you in and to contact you about your account.
          </li>
          <li>
            <strong>Your account data.</strong> Your account balances, transactions, transfers and savings goals, and
            the details you enter with them, such as a recipient&apos;s name or a goal&apos;s name.
          </li>
          <li>
            <strong>Settings on your device.</strong> Preferences such as appearance and hidden balances, and a copy of
            your account data so the app opens quickly. They stay on your device and are removed when you sign out.
          </li>
          <li>
            <strong>Sign-in cookies on the website.</strong> When you log in on the website, cookies keep you signed
            in. They&apos;re only used for that.
          </li>
        </ul>
        <p>
          Minto doesn&apos;t collect card or bank account numbers, doesn&apos;t use your location or contacts, and
          doesn&apos;t use advertising or analytics trackers.
        </p>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          To run your account: sign you in, show your balances and history, apply transfers and goal changes, and keep
          your data secure. We don&apos;t sell your data or share it with advertisers.
        </p>
      </section>

      <section>
        <h2>Who processes it for us</h2>
        <p>These providers handle data only to run Minto for us:</p>
        <ul>
          <li>
            <strong>Supabase</strong> stores your account data and handles sign-in.
          </li>
          <li>
            <strong>Resend</strong> delivers sign-in emails.
          </li>
          <li>
            <strong>Vercel</strong> hosts the website.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we protect it</h2>
        <p>
          Data is encrypted in transit. Each account can read only its own data, and balances can only be changed
          through checked server functions, never directly from the app. On your phone, your sign-in session is kept
          in the device&apos;s secure storage.
        </p>
      </section>

      <section>
        <h2>Keeping and deleting your data</h2>
        <p>
          We keep your data while you have an account. You can delete your account at any time in the app under{" "}
          <strong>Profile → Delete account</strong>, or on the web from your account page (see{" "}
          <Link href="/delete-account">how to delete your account</Link>). This permanently removes your account, balances, transactions and
          goals. You can also ask us to delete it, or for a copy of your data, by emailing{" "}
          <a href={`mailto:${email}`}>{email}</a>.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>Minto is not intended for anyone under 18, and we don&apos;t knowingly collect data from children.</p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          If this policy changes, we&apos;ll update this page and the date above. Questions? Email{" "}
          <a href={`mailto:${email}`}>{email}</a> or visit <Link href="/support">Support</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
