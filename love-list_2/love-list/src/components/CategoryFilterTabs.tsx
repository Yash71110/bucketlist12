"use client";

import { motion } from "framer-motion";
import { CATEGORIES } from "@/types";

export function CategoryFilterTabs({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (category: string | null) => void;
}) {
  const tabs = ["All", ...CATEGORIES];

  return (
    <div className="w-full max-w-xs flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
      {tabs.map((tab) => {
        const value = tab === "All" ? null : tab;
        const isActive = selected === value;
        return (
          <motion.button
            key={tab}
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelect(value)}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-body whitespace-nowrap transition-colors"
            style={{
              background: isActive ? "var(--candy)" : "white",
              color: isActive ? "white" : "var(--ink-soft)",
              border: `1px solid ${isActive ? "var(--candy)" : "var(--blush-deep)"}`,
            }}
          >
            {tab}
          </motion.button>
        );
      })}
    </div>
  );
}
