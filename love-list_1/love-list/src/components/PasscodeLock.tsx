"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Delete, Heart } from "lucide-react";
import { unlockWithPasscode } from "@/app/actions/auth";

// Change this if you use a passcode longer/shorter than 4 digits — the
// keypad auto-submits the instant it reaches this length.
const PIN_LENGTH = 4;

const HEART_PATH =
  "M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z";

type Stage = "idle" | "checking" | "success" | "error";

interface FloatingHeart {
  id: number;
  x: number;
  rise: number;
  delay: number;
}

export function PasscodeLock({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState<string>("");
  const [stage, setStage] = useState<Stage>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [particles, setParticles] = useState<FloatingHeart[]>([]);
  const shakeCount = useRef(0);
  const [shakeKey, setShakeKey] = useState(0);

  // Lockout is derived from a target timestamp + a ticking clock, rather
  // than an explicit "locked" stage — so there's nothing to transition
  // out of once time runs out, it just stops being true.
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (lockedUntil === null) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const remainingMs =
    lockedUntil !== null && now !== null ? Math.max(0, lockedUntil - now) : 0;
  const isLocked = remainingMs > 0;
  const isBusy = stage === "checking" || stage === "success" || isLocked;
  const progress = digits.length / PIN_LENGTH;

  const triggerShake = useCallback(() => {
    shakeCount.current += 1;
    setShakeKey(shakeCount.current);
  }, []);

  const spawnHeartBurst = useCallback(() => {
    const burst = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 140,
      rise: 90 + Math.random() * 40,
      delay: Math.random() * 0.25,
    }));
    setParticles(burst);
  }, []);

  const submit = useCallback(
    async (pin: string) => {
      setStage("checking");
      const result = await unlockWithPasscode(pin);

      if (result.success) {
        setStage("success");
        spawnHeartBurst();
        setTimeout(onUnlock, 700);
        return;
      }

      setDigits("");
      triggerShake();

      if (result.error === "locked") {
        setLockedUntil(Date.now() + result.retryAfterMs);
        setNow(Date.now());
        setStage("error");
        setMessage("Too many tries — take a little breather");
        return;
      }

      if (result.error === "wrong_pin") {
        setStage("error");
        setMessage(
          result.attemptsRemaining <= 2
            ? `Not quite — ${result.attemptsRemaining} tries left`
            : "Not quite — try again"
        );
      } else {
        setStage("error");
        setMessage("Something's misconfigured — check the setup");
      }
      setTimeout(() => setStage("idle"), 900);
    },
    [onUnlock, spawnHeartBurst, triggerShake]
  );

  const pressDigit = (d: string) => {
    if (isBusy) return;
    const next = (digits + d).slice(0, PIN_LENGTH);
    setDigits(next);
    if (next.length === PIN_LENGTH) {
      submit(next);
    }
  };

  const pressBackspace = () => {
    if (isBusy) return;
    setDigits((d) => d.slice(0, -1));
  };

  const helperText = isLocked
    ? `${message ?? "Take a little breather"} · ${Math.ceil(remainingMs / 1000)}s`
    : message ?? "Enter our little code";

  return (
    <div className="min-h-screen flex items-center justify-center bg-blush px-6">
      <motion.div
        key={shakeKey}
        animate={stage === "error" ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-xs flex flex-col items-center"
      >
        {/* Heart gauge — fills as digits go in, pops on success */}
        <div className="relative w-24 h-24 mb-6">
          <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-sm">
            <defs>
              <clipPath id="heartClip">
                <path d={HEART_PATH} />
              </clipPath>
            </defs>
            <path
              d={HEART_PATH}
              fill="var(--blush-deep)"
              stroke="var(--candy)"
              strokeWidth="14"
            />
            <g clipPath="url(#heartClip)">
              <motion.rect
                x={0}
                width={512}
                fill={stage === "error" ? "var(--ink-soft)" : "var(--candy)"}
                animate={{
                  y: 512 - 512 * (stage === "success" ? 1 : progress),
                  height: 512 * (stage === "success" ? 1 : progress),
                }}
                initial={false}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              />
            </g>
          </svg>

          <AnimatePresence>
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute left-1/2 top-1/2 text-candy"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                animate={{ x: p.x, y: -p.rise, opacity: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
                onAnimationComplete={() =>
                  setParticles((cur) => cur.filter((h) => h.id !== p.id))
                }
              >
                <Heart className="w-4 h-4 fill-candy" />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <h1 className="font-display text-2xl text-ink mb-1">
          {stage === "success" ? "Welcome back" : "Hey you"}
        </h1>
        <p className="font-body text-sm text-ink-soft mb-6 h-5 text-center">
          {helperText}
        </p>

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <motion.button
              key={d}
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={() => pressDigit(d)}
              disabled={isBusy}
              className="aspect-square rounded-full bg-white text-ink font-display text-xl shadow-sm border border-blush-deep
                         disabled:opacity-40 active:bg-blush-deep transition-colors"
            >
              {d}
            </motion.button>
          ))}

          <div />

          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => pressDigit("0")}
            disabled={isBusy}
            className="aspect-square rounded-full bg-white text-ink font-display text-xl shadow-sm border border-blush-deep
                       disabled:opacity-40 active:bg-blush-deep transition-colors"
          >
            0
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={pressBackspace}
            disabled={isBusy}
            className="aspect-square rounded-full flex items-center justify-center text-ink-soft
                       disabled:opacity-30 active:text-candy transition-colors"
            aria-label="Delete digit"
          >
            <Delete className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
