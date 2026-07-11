"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { CATEGORIES } from "@/types";
import type { NewBucketListItemInput } from "@/types";

export function BucketListForm({
  onSubmit,
}: {
  onSubmit: (input: NewBucketListItemInput) => Promise<{ error: string | null }>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [targetDate, setTargetDate] = useState("");
  const [isPriority, setIsPriority] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [showCoords, setShowCoords] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    setTargetDate("");
    setIsPriority(false);
    setLocationName("");
    setShowCoords(false);
    setLatitude("");
    setLongitude("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);

    const { error } = await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      target_date: targetDate || null,
      is_priority: isPriority,
      location_name: locationName.trim() || undefined,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
    });

    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        className="w-full max-w-xs rounded-2xl bg-candy text-white font-display text-sm py-3 flex items-center justify-center gap-2 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add a goal
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.form
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        onSubmit={handleSubmit}
        className="w-full max-w-xs rounded-2xl bg-white border border-blush-deep p-4 flex flex-col gap-3 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base text-ink">New goal</h3>
          <button
            type="button"
            onClick={() => {
              reset();
              setOpen(false);
            }}
            className="text-ink-soft"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do we want to do?"
          required
          className="rounded-xl border border-blush-deep px-3 py-2 text-sm font-body outline-none focus:border-candy"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Any details? (optional)"
          rows={2}
          className="rounded-xl border border-blush-deep px-3 py-2 text-sm font-body outline-none focus:border-candy resize-none"
        />

        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 rounded-xl border border-blush-deep px-2 py-2 text-sm font-body outline-none focus:border-candy"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="flex-1 rounded-xl border border-blush-deep px-2 py-2 text-sm font-body outline-none focus:border-candy"
          />
        </div>

        <input
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Location (optional)"
          className="rounded-xl border border-blush-deep px-3 py-2 text-sm font-body outline-none focus:border-candy"
        />

        <button
          type="button"
          onClick={() => setShowCoords((s) => !s)}
          className="text-xs font-body text-periwinkle text-left underline underline-offset-2"
        >
          {showCoords ? "Hide map coordinates" : "Add map coordinates (for Love Map)"}
        </button>

        {showCoords && (
          <div className="flex gap-2">
            <input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitude"
              inputMode="decimal"
              className="flex-1 rounded-xl border border-blush-deep px-2 py-2 text-xs font-mono outline-none focus:border-candy"
            />
            <input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude"
              inputMode="decimal"
              className="flex-1 rounded-xl border border-blush-deep px-2 py-2 text-xs font-mono outline-none focus:border-candy"
            />
          </div>
        )}

        <label className="flex items-center gap-2 text-xs font-body text-ink-soft">
          <input
            type="checkbox"
            checked={isPriority}
            onChange={(e) => setIsPriority(e.target.checked)}
            className="accent-candy"
          />
          High priority (shows a countdown on the dashboard)
        </label>

        {error && <p className="text-xs text-candy-deep font-body">{error}</p>}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={submitting}
          className="rounded-xl bg-candy text-white font-display text-sm py-2.5 disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add to our list"}
        </motion.button>
      </motion.form>
    </AnimatePresence>
  );
}
