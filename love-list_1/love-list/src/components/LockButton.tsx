"use client";

import { useTransition } from "react";
import { lockApp } from "@/app/actions/auth";

export function LockButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await lockApp();
          window.location.reload();
        })
      }
      className="font-body text-sm text-ink-soft underline underline-offset-4 disabled:opacity-50"
    >
      {isPending ? "Locking…" : "Lock the app"}
    </button>
  );
}
