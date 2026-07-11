"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Heart } from "lucide-react";
import type { BucketListItem } from "@/types";

// Deterministic per-card "scattered on a table" tilt, derived from the
// item's id rather than Math.random() so it stays stable across renders.
function hashRotate(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 13) - 6; // -6..6 degrees
}

export function PolaroidCard({ item }: { item: BucketListItem }) {
  const [flipped, setFlipped] = useState(false);
  const baseRotate = hashRotate(item.id);

  return (
    <motion.div
      style={{ rotate: baseRotate, perspective: 1000 }}
      whileHover={{ scale: 1.05, rotate: baseRotate + (baseRotate >= 0 ? 3 : -3) }}
      className="cursor-pointer select-none"
      onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full aspect-[4/5]"
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 bg-white p-2.5 pb-8 shadow-md rounded-sm flex flex-col"
        >
          <div className="flex-1 bg-blush-deep overflow-hidden">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-candy/50">
                <Heart className="w-8 h-8" />
              </div>
            )}
          </div>
          <p className="font-display text-xs text-ink text-center mt-2 truncate px-1">
            {item.title}
          </p>
        </div>

        {/* Back */}
        <div
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          className="absolute inset-0 bg-blush-deep p-4 shadow-md rounded-sm flex flex-col gap-2"
        >
          <p className="font-display text-sm text-ink">{item.title}</p>

          {item.completed_at && (
            <p className="flex items-center gap-1.5 text-[11px] font-body text-ink-soft">
              <Calendar className="w-3 h-3" />
              {new Date(item.completed_at).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}

          {item.location_name && (
            <p className="flex items-center gap-1.5 text-[11px] font-body text-ink-soft">
              <MapPin className="w-3 h-3" />
              {item.location_name}
            </p>
          )}

          {item.journal_entry && (
            <p className="font-body text-xs text-ink leading-snug mt-1 overflow-y-auto">
              {item.journal_entry}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
