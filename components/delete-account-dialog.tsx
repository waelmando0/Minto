"use client";

import * as React from "react";
import { LoaderCircle, Trash2 } from "lucide-react";

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
import { authErrorMessage } from "@/lib/login";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const CONFIRM_WORD = "DELETE";

/**
 * Permanently deletes the signed-in account (the same `delete_my_account`
 * server function the app uses), then signs this browser out.
 */
export function DeleteAccountDialog() {
  const [open, setOpen] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [pending, setPending] = React.useState(false);
  const id = React.useId();
  const confirmed = typed.trim().toUpperCase() === CONFIRM_WORD;

  async function deleteAccount(event: React.FormEvent) {
    event.preventDefault();
    if (!confirmed || pending) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return setError("Account deletion isn't available right now. Email us instead.");

    setPending(true);
    setError(undefined);
    try {
      const { error: rpcError } = await supabase.rpc("delete_my_account");
      if (rpcError) throw rpcError;
      // The user no longer exists on the server, so only clear this browser.
      await supabase.auth.signOut({ scope: "local" });
      window.location.assign(new URL("/delete-account?done=1", window.location.origin));
    } catch (e) {
      setError(authErrorMessage(e && typeof e === "object" ? e : {}));
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setTyped("");
          setError(undefined);
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-danger underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-danger focus-visible:outline-none"
        >
          <Trash2 className="size-4" aria-hidden />
          Delete account
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl border-0 sm:p-9">
        <DialogHeader className="items-start gap-3">
          <DialogTitle>Delete your Minto account?</DialogTitle>
          <DialogDescription>
            Your account, balances, transactions and goals are permanently deleted, on the web and in the app. This
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={deleteAccount} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`${id}-confirm`}>Type {CONFIRM_WORD} to confirm</Label>
            <Input
              id={`${id}-confirm`}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              className="h-12 rounded-xl"
            />
            {error ? (
              <p id={`${id}-error`} role="alert" className="text-xs text-danger">
                {error}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={!confirmed || pending}
            className={cn(
              pillVariants({ tone: "dark", size: "lg" }),
              "h-12 w-full bg-danger normal-case tracking-normal hover:bg-danger disabled:opacity-50",
            )}
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
            {pending ? "Deleting your account" : "Permanently delete my account"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
