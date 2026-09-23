"use client";

import * as React from "react";
import { ArrowLeft, LoaderCircle, MailCheck } from "lucide-react";

import { requestCode, verifyCode } from "@/app/actions/login";
import { MintoMark } from "@/components/logo";
import { pillVariants } from "@/components/store-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialLoginState, type LoginState } from "@/lib/login";
import { cn } from "@/lib/utils";

/** Wraps any trigger (e.g. the navbar "Login" pill) with the passwordless sign-in dialog. */
export function LoginDialog({ children }: { children: React.ReactElement }) {
  const [open, setOpen] = React.useState(false);
  // Remounting the flow resets every step's action state.
  const [flowKey, setFlowKey] = React.useState(0);
  const restart = () => setFlowKey((key) => key + 1);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) restart();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl border-0 sm:p-9">
        <LoginFlow key={flowKey} onRestart={restart} />
      </DialogContent>
    </Dialog>
  );
}

/** Email first, then the one-time code from the email. */
function LoginFlow({ onRestart }: { onRestart: () => void }) {
  const [state, formAction, pending] = React.useActionState(requestCode, initialLoginState);

  if (state.status === "success" && state.email) {
    return <CodeStep email={state.email} onBack={onRestart} />;
  }

  return <EmailStep state={state} formAction={formAction} pending={pending} />;
}

function EmailStep({
  state,
  formAction,
  pending,
}: {
  state: LoginState;
  formAction: (formData: FormData) => void;
  pending: boolean;
}) {
  const id = React.useId();
  const errorId = `${id}-error`;
  const invalid = state.status === "error";

  return (
    <>
      <DialogHeader className="items-start gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-[#111] text-white">
          <MintoMark />
        </span>
        <DialogTitle>Log in to Minto</DialogTitle>
        <DialogDescription>
          Enter your email and we&apos;ll send you a one-time sign-in code. No password needed.
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} noValidate className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${id}-email`}>Email</Label>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            defaultValue={state.email}
            required
            autoFocus
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            className="h-12 rounded-xl"
          />
          {invalid ? (
            <p id={errorId} role="alert" className="text-xs text-danger">
              {state.message}
            </p>
          ) : null}
        </div>
        <SubmitButton pending={pending} idle="Send code" busy="Sending code" />
        <p className="text-center text-xs text-muted-foreground">New to Minto? The same code creates your account.</p>
      </form>
    </>
  );
}

function CodeStep({ email, onBack }: { email: string; onBack: () => void }) {
  const [state, formAction, pending] = React.useActionState(verifyCode, { status: "idle", email });
  const [resend, resendAction, resending] = React.useActionState(requestCode, initialLoginState);
  const id = React.useId();
  const errorId = `${id}-error`;
  const invalid = state.status === "error";

  return (
    <>
      <DialogHeader className="items-start gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-mint text-mint-foreground">
          <MailCheck className="size-5" aria-hidden />
        </span>
        <DialogTitle>Check your inbox</DialogTitle>
        <DialogDescription>
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>. Enter it below, or
          open the link in the email on this device.
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} noValidate className="grid gap-4">
        <input type="hidden" name="email" value={email} />
        <div className="grid gap-2">
          <Label htmlFor={`${id}-code`}>Sign-in code</Label>
          <Input
            id={`${id}-code`}
            name="code"
            type="text"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={10}
            placeholder="123456"
            required
            autoFocus
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            className="h-12 rounded-xl text-center text-lg tracking-[0.35em] tabular-nums"
          />
          {invalid ? (
            <p id={errorId} role="alert" className="text-xs text-danger">
              {state.message}
            </p>
          ) : null}
        </div>
        <SubmitButton pending={pending} idle="Log in" busy="Checking code" />
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-md font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Use a different email
        </button>
        <form action={resendAction}>
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            disabled={resending}
            className="rounded-md font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none disabled:opacity-60"
          >
            {resending ? "Sending…" : "Send a new code"}
          </button>
        </form>
      </div>
      <p aria-live="polite" className="-mt-2 text-center text-xs text-muted-foreground empty:hidden">
        {resend.status === "success"
          ? "New code sent. Use the one in the latest email."
          : resend.status === "error"
            ? resend.message
            : ""}
      </p>
    </>
  );
}

function SubmitButton({ pending, idle, busy }: { pending: boolean; idle: string; busy: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(pillVariants({ tone: "dark", size: "lg" }), "h-12 w-full disabled:opacity-70")}
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
      {pending ? busy : idle}
    </button>
  );
}
