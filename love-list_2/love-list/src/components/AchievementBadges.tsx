"use client";

import { motion } from "framer-motion";
import { Footprints, Camera, Trophy, Globe2, Flame, Crown } from "lucide-react";
import type { BucketListItem } from "@/types";
import { getLevelInfo } from "@/lib/pet";

interface Badge {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  unlocked: boolean;
}

export function AchievementBadges({
  items,
  petXp,
}: {
  items: BucketListItem[];
  petXp: number;
}) {
  const completed = items.filter((i) => i.status === "completed");
  const withLocation = completed.filter(
    (i) => i.latitude != null && i.longitude != null
  );
  const level = getLevelInfo(petXp).level;
  const stage = getLevelInfo(petXp).stage;

  const badges: Badge[] = [
    {
      id: "first-steps",
      label: "First goal added",
      icon: Footprints,
      unlocked: items.length >= 1,
    },
    {
      id: "first-memory",
      label: "First memory made",
      icon: Camera,
      unlocked: completed.length >= 1,
    },
    {
      id: "ten-memories",
      label: "10 memories made",
      icon: Trophy,
      unlocked: completed.length >= 10,
    },
    {
      id: "world-traveler",
      label: "3 places on the map",
      icon: Globe2,
      unlocked: withLocation.length >= 3,
    },
    {
      id: "devoted",
      label: "Pet reached level 5",
      icon: Flame,
      unlocked: level >= 5,
    },
    {
      id: "soulmates",
      label: "Pet became a Soulmate",
      icon: Crown,
      unlocked: stage === "soulmate",
    },
  ];

  return (
    <div className="w-full max-w-xs">
      <p className="font-display text-sm text-ink-soft mb-2 px-1">
        Achievements
      </p>
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            whileHover={badge.unlocked ? { scale: 1.06 } : undefined}
            title={badge.label}
            className="shrink-0 w-16 flex flex-col items-center gap-1"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: badge.unlocked ? "var(--sunbeam)" : "var(--blush)",
                border: `1.5px solid ${
                  badge.unlocked ? "var(--sunbeam)" : "var(--blush-deep)"
                }`,
              }}
            >
              <badge.icon
                className="w-5 h-5"
                style={{
                  color: badge.unlocked ? "white" : "var(--ink-soft)",
                  opacity: badge.unlocked ? 1 : 0.5,
                }}
              />
            </div>
            <p
              className="font-body text-[9px] text-center leading-tight"
              style={{
                color: badge.unlocked ? "var(--ink)" : "var(--ink-soft)",
                opacity: badge.unlocked ? 1 : 0.6,
              }}
            >
              {badge.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
