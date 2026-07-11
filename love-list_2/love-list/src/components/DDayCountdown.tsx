"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { BucketListItem } from "@/types";

function useNowTicking(intervalMs: number) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function DDayCard({ item, now }: { item: BucketListItem; now: number }) {
  const target = new Date(item.target_date + "T00:00:00").getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="shrink-0 w-44 rounded-2xl p-4 flex flex-col gap-2"
      style={{
        background:
          "linear-gradient(160deg, var(--sunbeam) 0%, var(--candy) 100%)",
      }}
    >
      <p className="font-display text-white text-sm leading-tight line-clamp-2 drop-shadow-sm">
        {item.title}
      </p>
      <div className="flex items-end gap-2 font-mono text-white">
        <div className="text-center">
          <div className="text-xl leading-none">{days}</div>
          <div className="text-[9px] opacity-80">days</div>
        </div>
        <div className="text-center">
          <div className="text-xl leading-none">{hours}</div>
          <div className="text-[9px] opacity-80">hrs</div>
        </div>
        <div className="text-center">
          <div className="text-xl leading-none">{minutes}</div>
          <div className="text-[9px] opacity-80">min</div>
        </div>
      </div>
    </motion.div>
  );
}

export function DDayCountdown({ items }: { items: BucketListItem[] }) {
  const now = useNowTicking(30_000);

  const priorityItems = items
    .filter(
      (i) =>
        i.status === "pending" &&
        i.is_priority &&
        i.target_date &&
        new Date(i.target_date + "T00:00:00").getTime() > now
    )
    .sort(
      (a, b) =>
        new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime()
    );

  if (priorityItems.length === 0) return null;

  return (
    <div className="w-full max-w-xs">
      <p className="font-display text-sm text-ink-soft mb-2 px-1">
        Coming up
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {priorityItems.map((item) => (
          <DDayCard key={item.id} item={item} now={now} />
        ))}
      </div>
    </div>
  );
}
