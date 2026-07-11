"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useBucketListItems } from "@/hooks/useBucketListItems";
import { PolaroidCard } from "@/components/PolaroidCard";
import { ReactionBar } from "@/components/ReactionBar";

export default function GalleryPage() {
  const { items, loading, reactToItem } = useBucketListItems();
  const memories = items
    .filter((i) => i.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.completed_at ?? b.updated_at).getTime() -
        new Date(a.completed_at ?? a.updated_at).getTime()
    );

  return (
    <main className="min-h-screen bg-blush px-4 py-6">
      <header className="flex items-center gap-3 mb-6 max-w-2xl mx-auto">
        <Link
          href="/"
          className="w-9 h-9 rounded-full bg-white border border-blush-deep flex items-center justify-center text-ink-soft shrink-0"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display text-xl text-ink">Our scrapbook</h1>
          <p className="font-body text-xs text-ink-soft">
            {memories.length} memories and counting
          </p>
        </div>
      </header>

      {loading && (
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] rounded-sm bg-white/60 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && memories.length === 0 && (
        <p className="font-body text-sm text-ink-soft text-center py-16">
          No memories yet — complete a goal together and it will show up here 💌
        </p>
      )}

      {!loading && memories.length > 0 && (
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8">
          {memories.map((item) => (
            <div key={item.id}>
              <PolaroidCard item={item} />
              <ReactionBar
                reactions={item.reactions}
                onReact={(emoji) => reactToItem(item.id, emoji)}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
