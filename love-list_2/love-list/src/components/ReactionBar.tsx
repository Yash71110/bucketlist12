"use client";

import { motion } from "framer-motion";
import { REACTION_EMOJIS } from "@/types";

export function ReactionBar({
  reactions,
  onReact,
}: {
  reactions: Record<string, number>;
  onReact: (emoji: string) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-1.5">
      {REACTION_EMOJIS.map((emoji) => {
        const count = reactions[emoji] ?? 0;
        return (
          <motion.button
            key={emoji}
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              onReact(emoji);
            }}
            className="flex items-center gap-0.5 rounded-full bg-white border border-blush-deep px-1.5 py-0.5 text-xs"
          >
            <span>{emoji}</span>
            {count > 0 && (
              <span className="font-mono text-[10px] text-ink-soft">
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
