"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import type { BucketListItem, CompleteItemInput } from "@/types";
import { uploadMemoryImage } from "@/lib/storage";

export function CompleteGoalModal({
  item,
  onClose,
  onComplete,
}: {
  item: BucketListItem;
  onClose: () => void;
  onComplete: (id: string, input: CompleteItemInput) => Promise<{ error: string | null }>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [journalEntry, setJournalEntry] = useState("");
  const [locationName, setLocationName] = useState(item.location_name ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File | null) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    let imageUrl: string | null = null;
    if (file) {
      const result = await uploadMemoryImage(file, item.id);
      if (result.error) {
        setError(`Couldn't upload photo: ${result.error}`);
        setSubmitting(false);
        return;
      }
      imageUrl = result.url;
    }

    const { error } = await onComplete(item.id, {
      image_url: imageUrl,
      journal_entry: journalEntry.trim(),
      completed_location_name: locationName.trim() || undefined,
    });

    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-sm rounded-3xl bg-white p-5 flex flex-col gap-3 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">Mark as done 🎉</h3>
          <button onClick={onClose} aria-label="Close" className="text-ink-soft">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="font-body text-sm text-ink-soft -mt-2">{item.title}</p>

        <label className="rounded-2xl border-2 border-dashed border-blush-deep aspect-video flex items-center justify-center overflow-hidden cursor-pointer bg-blush">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Memory preview" className="w-full h-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-ink-soft">
              <ImageIcon className="w-6 h-6" />
              <span className="font-body text-xs">Add a photo</span>
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <textarea
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          placeholder="How did it go? Write it down for the scrapbook…"
          rows={3}
          className="rounded-xl border border-blush-deep px-3 py-2 text-sm font-body outline-none focus:border-candy resize-none"
        />

        <input
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Where did this happen?"
          className="rounded-xl border border-blush-deep px-3 py-2 text-sm font-body outline-none focus:border-candy"
        />

        {error && <p className="text-xs text-candy-deep font-body">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-xl bg-meadow text-white font-display text-sm py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Saving…" : "Complete goal"}
        </motion.button>
      </motion.div>
    </div>
  );
}
