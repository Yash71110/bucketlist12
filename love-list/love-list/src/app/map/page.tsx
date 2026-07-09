"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { useBucketListItems } from "@/hooks/useBucketListItems";

const MapView = dynamic(
  () => import("@/components/MapView").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center font-body text-sm text-ink-soft">
        Loading the map…
      </div>
    ),
  }
);

export default function MapPage() {
  const { items, loading } = useBucketListItems();
  const pinCount = items.filter(
    (i) => i.status === "completed" && i.latitude != null && i.longitude != null
  ).length;

  return (
    <main className="min-h-screen bg-blush flex flex-col">
      <header className="flex items-center gap-3 p-4 shrink-0">
        <Link
          href="/"
          className="w-9 h-9 rounded-full bg-white border border-blush-deep flex items-center justify-center text-ink-soft shrink-0"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display text-xl text-ink">Our love map</h1>
          <p className="font-body text-xs text-ink-soft">
            {pinCount} places we have made memories
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[70vh] rounded-t-3xl overflow-hidden border-t border-blush-deep">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center font-body text-sm text-ink-soft">
            Loading…
          </div>
        ) : (
          <MapView items={items} />
        )}
      </div>
    </main>
  );
}
