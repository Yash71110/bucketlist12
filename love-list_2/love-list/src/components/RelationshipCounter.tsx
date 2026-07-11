"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Pencil } from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";

export function RelationshipCounter() {
  const { settings, loading, setRelationshipStartDate } = useAppSettings();
  const [now] = useState(() => Date.now());
  const [editing, setEditing] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <div className="w-full max-w-xs h-14 rounded-2xl bg-white border border-blush-deep animate-pulse" />
    );
  }

  const startDate = settings?.relationship_start_date ?? null;

  const handleSave = async () => {
    if (!dateInput) return;
    setSaving(true);
    await setRelationshipStartDate(dateInput);
    setSaving(false);
    setEditing(false);
  };

  if (!startDate || editing) {
    return (
      <div className="w-full max-w-xs rounded-2xl bg-white border border-blush-deep p-4 flex flex-col gap-2">
        <p className="font-display text-sm text-ink">When did it start? 💕</p>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="flex-1 rounded-xl border border-blush-deep px-2 py-2 text-sm font-body outline-none focus:border-candy"
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving || !dateInput}
            className="rounded-xl bg-candy text-white font-display text-sm px-4 disabled:opacity-50"
          >
            {saving ? "…" : "Save"}
          </motion.button>
        </div>
      </div>
    );
  }

  const days =
    Math.floor(
      (now - new Date(startDate + "T00:00:00").getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return (
    <motion.button
      type="button"
      onClick={() => {
        setDateInput(startDate);
        setEditing(true);
      }}
      whileTap={{ scale: 0.97 }}
      className="w-full max-w-xs rounded-2xl px-4 py-3 flex items-center justify-center gap-2 text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--candy) 0%, var(--periwinkle) 100%)",
      }}
    >
      <Heart className="w-4 h-4 fill-white shrink-0" />
      <span className="font-display text-sm">
        Together for {days.toLocaleString()} days
      </span>
      <Pencil className="w-3 h-3 opacity-70 shrink-0" />
    </motion.button>
  );
}
