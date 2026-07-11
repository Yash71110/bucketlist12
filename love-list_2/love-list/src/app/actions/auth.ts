"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;
const ATTEMPTS_COOKIE = "ll_pin_attempts";
const LOCKED_UNTIL_COOKIE = "ll_pin_locked_until";

export type UnlockResult =
  | { success: true }
  | { success: false; error: "locked"; retryAfterMs: number }
  | { success: false; error: "wrong_pin"; attemptsRemaining: number }
  | { success: false; error: "server_misconfigured" | "auth_failed" };

export async function unlockWithPasscode(
  passcode: string
): Promise<UnlockResult> {
  const cookieStore = await cookies();
  const now = Date.now();

  const lockedUntilRaw = cookieStore.get(LOCKED_UNTIL_COOKIE)?.value;
  const lockedUntil = lockedUntilRaw ? parseInt(lockedUntilRaw, 10) : 0;

  if (lockedUntil > now) {
    return { success: false, error: "locked", retryAfterMs: lockedUntil - now };
  }

  const expectedPasscode = process.env.APP_SHARED_PASSCODE;
  if (!expectedPasscode) {
    return { success: false, error: "server_misconfigured" };
  }

  if (passcode !== expectedPasscode) {
    const attemptsRaw = cookieStore.get(ATTEMPTS_COOKIE)?.value;
    const attempts = (attemptsRaw ? parseInt(attemptsRaw, 10) : 0) + 1;

    if (attempts >= MAX_ATTEMPTS) {
      cookieStore.set(LOCKED_UNTIL_COOKIE, String(now + LOCKOUT_MS), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60,
      });
      cookieStore.set(ATTEMPTS_COOKIE, "0", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60,
      });
      return { success: false, error: "locked", retryAfterMs: LOCKOUT_MS };
    }

    cookieStore.set(ATTEMPTS_COOKIE, String(attempts), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 300,
    });
    return {
      success: false,
      error: "wrong_pin",
      attemptsRemaining: MAX_ATTEMPTS - attempts,
    };
  }

  // Correct PIN — clear any prior failed-attempt tracking.
  cookieStore.delete(ATTEMPTS_COOKIE);
  cookieStore.delete(LOCKED_UNTIL_COOKIE);

  // Quietly sign in to Supabase using the shared app-level credential.
  // This is the "Supabase login happens once in the background" step —
  // invisible to whoever's typing the PIN.
  const sharedEmail = process.env.SUPABASE_SHARED_EMAIL;
  const sharedPassword = process.env.SUPABASE_SHARED_PASSWORD;
  if (!sharedEmail || !sharedPassword) {
    return { success: false, error: "server_misconfigured" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: sharedEmail,
    password: sharedPassword,
  });

  if (error) {
    return { success: false, error: "auth_failed" };
  }

  return { success: true };
}

export async function lockApp(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
