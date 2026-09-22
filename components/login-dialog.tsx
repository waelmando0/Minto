"use client";

import * as React from "react";
import { LoaderCircle, MailCheck } from "lucide-react";

import { requestMagicLink } from "@/app/actions/login";
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
import { initialLoginState } from "@/lib/login";
import { cn } from "@/lib/utils";

/** Wraps any trigger (e.g. the navbar "Login" pill) with the passwordless sign-in dialog. */
export function LoginDialog({ children }: { children: React.ReactElement }) {
  const [open, setOpen] = React.useState(false);
  // Remounting the form on every open resets the action state.
  const [formKey, setFormKey] = React.useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setFormKey((key) => key + 1);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl border-0 sm:p-9">
        <LoginForm key={formKey} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = React.useActionState(requestMagicLink, initialLoginState);
  const id = React.useId();
  const errorId = `${id}-error`;

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-mint text-mint-foreground">
          <MailCheck className="size-6" aria-hidden />
        </span>
        <DialogTitle className="text-xl">Check your inbox</DialogTitle>
        <DialogDescription className="max-w-xs">
          We sent a secure sign-in link to <span className="font-medium text-foreground">{state.email}</span>. It
          expires in 15 minutes.
        </DialogDescription>
        <button type="button" onClick={onDone} className={cn(pillVariants({ tone: "dark", size: "lg" }), "mt-2")}>
          Done
        </button>
      </div>
    );
  }

  const invalid = state.status === "error";

  return (
    <>
      <DialogHeader className="items-start gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-[#111] text-white">
          <MintoMark />
        </span>
        <DialogTitle>Log in to Minto</DialogTitle>
        <DialogDescription>Enter your email and we&apos;ll send you a secure, password-free sign-in link.</DialogDescription>
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
            <p id={errorId} className="text-xs text-danger">
              {state.message}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={pending}
          className={cn(pillVariants({ tone: "dark", size: "lg" }), "h-12 w-full disabled:opacity-70")}
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? "Sending link" : "Send magic link"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          New to Minto? The same link creates your account.
        </p>
      </form>
    </>
  );
}
