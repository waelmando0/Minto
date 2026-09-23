import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal-page";
import { mintoMeta } from "@/lib/content";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with Minto: signing in, your account, and deleting your data.",
  alternates: { canonical: "/support" },
};

const email = mintoMeta.contactEmail;

export default function SupportPage() {
  return (
    <LegalPage
      title="Support"
      intro={
        <p>
          Need help with Minto? Email <a href={`mailto:${email}`}>{email}</a> and we&apos;ll get back to you, usually
          within two business days.
        </p>
      }
    >
      <section>
        <h2>I didn&apos;t get a sign-in code</h2>
        <p>
          Check your spam and promotions folders, then ask for a new code in the app. Codes expire after an hour, and
          only the newest code works.
        </p>
      </section>

      <section>
        <h2>My code says it&apos;s wrong or expired</h2>
        <p>Request a new code and use the one in the most recent email.</p>
      </section>

      <section>
        <h2>Can I use Minto on the web?</h2>
        <p>
          Yes. Select <strong>Login</strong> on the Minto website to see your balances, recent activity and goals. To
          send money, top up or manage goals, use the app.
        </p>
      </section>

      <section>
        <h2>How do I delete my account?</h2>
        <p>
          In the app, open <strong>Profile → Delete account</strong>. This permanently deletes your account and all
          its data. You can also email us to ask for deletion.
        </p>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>
          Read our <Link href="/privacy">privacy policy</Link> to see what we collect and why.
        </p>
      </section>
    </LegalPage>
  );
}
