"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, MapPin } from "lucide-react";
import type { BucketListItem } from "@/types";

const ITEM_HEIGHT = 56;
const REPEAT = 6;

export function DateNightRoulette({ items }: { items: BucketListItem[] }) {
  const pending = items.filter((i) => i.status === "pending");
  const [spinning, setSpinning] = useState(false);
  const [reel, setReel] = useState<BucketListItem[] | null>(null);
  const [targetOffset, setTargetOffset] = useState(0);
  const [winner, setWinner] = useState<BucketListItem | null>(null);

  const spin = () => {
    if (pending.length === 0 || spinning) return;
    setWinner(null);
    setSpinning(true);

    const winnerIndex = Math.floor(Math.random() * pending.length);
    const built: BucketListItem[] = [];
    for (let r = 0; r < REPEAT; r++) built.push(...pending);
    const finalIndex = (REPEAT - 1) * pending.length + winnerIndex;

    setReel(built);
    setTargetOffset(0);
    // Kick the animation on the next frame so it visibly starts from 0.
    requestAnimationFrame(() => {
      setTargetOffset(finalIndex * ITEM_HEIGHT);
    });

    setTimeout(() => {
      setSpinning(false);
      setWinner(pending[winnerIndex]);
    }, 2800);
  };

  return (
    <div className="w-full max-w-xs rounded-2xl bg-white border border-blush-deep p-4 flex flex-col items-center gap-3">
      <p className="font-display text-sm text-ink">Can&apos;t decide tonight?</p>

      <div
        className="relative w-full overflow-hidden rounded-xl bg-blush border border-blush-deep"
        style={{ height: ITEM_HEIGHT }}
      >
        <div className="absolute inset-0 border-y-2 border-candy/50 pointer-events-none z-10" />
        {reel && (
          <motion.div
            animate={{ y: -targetOffset }}
            transition={{ duration: 2.6, ease: [0.12, 0.72, 0.2, 1] }}
          >
            {reel.map((item, i) => (
              <div
                key={`${item.id}-${i}`}
                className="flex items-center justify-center px-3 font-display text-sm text-ink text-center"
                style={{ height: ITEM_HEIGHT }}
              >
                {item.title}
              </div>
            ))}
          </motion.div>
        )}
        {!reel && (
          <div className="flex items-center justify-center h-full font-body text-xs text-ink-soft">
            {pending.length === 0
              ? "Add a few goals first!"
              : "Tap spin to pick something"}
          </div>
        )}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={spin}
        disabled={spinning || pending.length === 0}
        className="rounded-full bg-periwinkle text-white font-display text-sm px-5 py-2 flex items-center gap-2 disabled:opacity-40"
      >
        <Shuffle className="w-4 h-4" />
        {spinning ? "Spinning…" : "Spin for us"}
      </motion.button>

      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full rounded-xl bg-meadow/10 border border-meadow px-3 py-2 text-center"
          >
            <p className="font-body text-[11px] text-meadow font-semibold uppercase tracking-wide">
              Tonight&apos;s pick
            </p>
            <p className="font-display text-sm text-ink">{winner.title}</p>
            {winner.location_name && (
              <p className="font-body text-[11px] text-ink-soft flex items-center justify-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {winner.location_name}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
