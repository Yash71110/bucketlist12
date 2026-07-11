"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePetState } from "@/hooks/usePetState";
import { getLevelInfo, type PetStage } from "@/lib/pet";

const STAGE_LABEL: Record<PetStage, string> = {
  egg: "Egg",
  hatchling: "Hatchling",
  companion: "Companion",
  soulmate: "Soulmate",
};

const STAGE_COLOR: Record<PetStage, string> = {
  egg: "var(--periwinkle)",
  hatchling: "var(--meadow)",
  companion: "var(--candy)",
  soulmate: "var(--sunbeam)",
};

const TAP_XP = 2;
const MAX_TAPS_PER_DAY = 5;
const TAPS_STORAGE_KEY = "love-list-pet-taps";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readTapsUsedToday(): number {
  try {
    const raw = window.localStorage.getItem(TAPS_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { date: string; count: number };
    return parsed.date === todayKey() ? parsed.count : 0;
  } catch {
    return 0;
  }
}

function writeTapsUsedToday(count: number) {
  try {
    window.localStorage.setItem(
      TAPS_STORAGE_KEY,
      JSON.stringify({ date: todayKey(), count })
    );
  } catch {
    // localStorage unavailable — the tap-limit just won't persist, harmless.
  }
}

function Creature({ stage }: { stage: PetStage }) {
  const color = STAGE_COLOR[stage];

  if (stage === "egg") {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <ellipse cx="60" cy="66" rx="34" ry="42" fill="var(--blush-deep)" stroke={color} strokeWidth="4" />
        <path d="M46 40 L58 58 L48 62 L62 82" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    );
  }

  const earSize = stage === "companion" || stage === "soulmate" ? 16 : 11;
  const bodyRx = stage === "soulmate" ? 40 : stage === "companion" ? 36 : 30;

  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {stage === "soulmate" && (
        <>
          <circle cx="18" cy="30" r="3" fill="var(--sunbeam)" />
          <circle cx="104" cy="24" r="2.5" fill="var(--candy)" />
          <circle cx="100" cy="90" r="2" fill="var(--periwinkle)" />
        </>
      )}

      {/* ears */}
      <circle cx={60 - bodyRx * 0.6} cy={70 - bodyRx * 0.85} r={earSize} fill={color} />
      <circle cx={60 + bodyRx * 0.6} cy={70 - bodyRx * 0.85} r={earSize} fill={color} />

      {/* body */}
      <ellipse cx="60" cy="70" rx={bodyRx} ry={bodyRx * 0.9} fill={color} />

      {/* blush */}
      <ellipse cx={60 - bodyRx * 0.45} cy="76" rx="6" ry="4" fill="white" opacity="0.35" />
      <ellipse cx={60 + bodyRx * 0.45} cy="76" rx="6" ry="4" fill="white" opacity="0.35" />

      {/* eyes */}
      <circle cx={60 - bodyRx * 0.35} cy="66" r="4.5" fill="var(--ink)" />
      <circle cx={60 + bodyRx * 0.35} cy="66" r="4.5" fill="var(--ink)" />

      {/* mouth */}
      <path d="M52 80 Q60 86 68 80" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />

      {stage === "soulmate" && (
        <path
          d="M60 32 c-4 -8 -16 -6 -16 3 c0 7 16 15 16 15 s16 -8 16 -15 c0 -9 -12 -11 -16 -3z"
          fill="var(--candy)"
        />
      )}
    </svg>
  );
}

export function PetWidget() {
  const { pet, loading, addXp } = usePetState();
  const [popText, setPopText] = useState<string | null>(null);
  const [bounceKey, setBounceKey] = useState(0);

  if (loading || !pet) {
    return (
      <div className="rounded-3xl bg-white border border-blush-deep p-5 w-full max-w-xs h-40 animate-pulse" />
    );
  }

  const info = getLevelInfo(pet.xp);

  const handlePet = () => {
    const used = readTapsUsedToday();
    setBounceKey((k) => k + 1);

    if (used >= MAX_TAPS_PER_DAY) {
      setPopText("Sleepy — try again tomorrow 💤");
      setTimeout(() => setPopText(null), 1200);
      return;
    }

    writeTapsUsedToday(used + 1);
    void addXp(TAP_XP);
    setPopText(`+${TAP_XP} XP`);
    setTimeout(() => setPopText(null), 900);
  };

  return (
    <div className="rounded-3xl bg-white border border-blush-deep p-5 w-full max-w-xs flex items-center gap-4 shadow-sm">
      <motion.button
        type="button"
        onClick={handlePet}
        aria-label="Give your pet some love"
        className="relative w-20 h-20 shrink-0"
      >
        <motion.div
          key={bounceKey}
          className="w-full h-full"
          animate={
            bounceKey > 0
              ? { y: [0, -14, 0], scale: [1, 1.08, 1] }
              : { y: [0, -6, 0] }
          }
          transition={
            bounceKey > 0
              ? { duration: 0.5, ease: "easeOut" }
              : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <Creature stage={info.stage} />
        </motion.div>

        <AnimatePresence>
          {popText && (
            <motion.span
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -24, scale: 1 }}
              exit={{ opacity: 0, y: -36 }}
              className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap font-display text-xs text-candy-deep bg-white/90 px-2 py-0.5 rounded-full shadow-sm"
            >
              {popText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="flex-1 min-w-0">
        <p className="font-display text-lg text-ink leading-tight truncate">
          {pet.name}
        </p>
        <p className="font-body text-xs text-ink-soft mb-2">
          Lv {info.level} · {STAGE_LABEL[info.stage]}
        </p>
        <div className="h-2.5 w-full rounded-full bg-blush overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--candy)" }}
            animate={{ width: `${Math.round(info.progressRatio * 100)}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <p className="font-mono text-[10px] text-ink-soft mt-1">
          {info.xpIntoLevel} / {info.xpForThisLevel} XP
        </p>
      </div>
    </div>
  );
}
