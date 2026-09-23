import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal-page";
import { LoginDialog } from "@/components/login-dialog";
import { pillVariants } from "@/components/store-buttons";
import { mintoMeta } from "@/lib/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Delete your account",
  description: "How to permanently delete your Minto account and its data, in the app or on the web.",
  alternates: { canonical: "/delete-account" },
};

const email = mintoMeta.contactEmail;

export default async function DeleteAccountPage({ searchParams }: PageProps<"/delete-account">) {
  const { done } = await searchParams;

  if (done) {
    return (
      <LegalPage
        title="Your account is deleted"
        intro={
          <p>
            Your Minto account and all its data have been permanently deleted. You&apos;ve been signed out. Thanks for
            trying Minto.
          </p>
        }
      >
        <p>
          <Link href="/">Back to the home page</Link>
        </p>
      </LegalPage>
    );
  }

  return (
    <LegalPage
      title="Delete your account"
      intro={<p>You can permanently delete your Minto account at any time, in the app or on the web.</p>}
    >
      <section>
        <h2>What gets deleted</h2>
        <p>
          Your account and everything in it: your profile, balances, transactions, transfers and savings goals. Deletion
          is immediate and permanent, and it can&apos;t be undone.
        </p>
      </section>

      <section>
        <h2>In the app</h2>
        <p>
          Open <strong>Profile</strong> (the avatar on the Home screen), then tap <strong>Delete account</strong> and
          confirm.
        </p>
      </section>

      <section>
        <h2>On the web</h2>
        <p>
          Log in with your email, then choose <strong>Delete account</strong> at the bottom of your account page.
        </p>
        <LoginDialog>
          <button
            type="button"
            className={cn(pillVariants({ tone: "dark", size: "lg" }), "mt-2 normal-case tracking-normal")}
          >
            Log in to delete your account
          </button>
        </LoginDialog>
      </section>

      <section>
        <h2>By email</h2>
        <p>
          Can&apos;t sign in? Email <a href={`mailto:${email}?subject=Delete%20my%20Minto%20account`}>{email}</a> from
          the address on your account and ask us to delete it. We&apos;ll confirm when it&apos;s done.
        </p>
      </section>
    </LegalPage>
  );
}
