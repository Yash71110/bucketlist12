"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Sparkles, Check } from "lucide-react";
import type { BucketListItem } from "@/types";

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BucketListCard({
  item,
  onCompleteClick,
}: {
  item: BucketListItem;
  onCompleteClick: (item: BucketListItem) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-xs rounded-2xl bg-white border border-blush-deep p-4 flex items-start gap-3 shadow-sm"
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={() => onCompleteClick(item)}
        aria-label="Mark as done"
        className="shrink-0 w-7 h-7 rounded-full border-2 border-meadow flex items-center justify-center mt-0.5
                   text-transparent hover:text-meadow hover:bg-meadow/10 transition-colors"
      >
        <Check className="w-4 h-4" />
      </motion.button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="font-display text-sm text-ink truncate">{item.title}</span>
          {item.is_priority && (
            <Sparkles className="w-3.5 h-3.5 text-sunbeam shrink-0" />
          )}
        </div>

        {item.description && (
          <p className="font-body text-xs text-ink-soft mb-1.5 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-blush text-ink-soft">
            {item.category}
          </span>
          {item.target_date && (
            <span className="flex items-center gap-1 text-[10px] font-body text-ink-soft">
              <Calendar className="w-3 h-3" />
              {formatDate(item.target_date)}
            </span>
          )}
          {item.location_name && (
            <span className="flex items-center gap-1 text-[10px] font-body text-ink-soft">
              <MapPin className="w-3 h-3" />
              {item.location_name}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
