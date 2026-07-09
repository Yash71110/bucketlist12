"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Images, Map as MapIcon } from "lucide-react";
import { useBucketListItems } from "@/hooks/useBucketListItems";
import { usePetState } from "@/hooks/usePetState";
import { XP_REWARDS } from "@/lib/pet";
import { fireGoalCompleteConfetti } from "@/lib/confetti";
import { PetWidget } from "@/components/PetWidget";
import { DDayCountdown } from "@/components/DDayCountdown";
import { DateNightRoulette } from "@/components/DateNightRoulette";
import { BucketListForm } from "@/components/BucketListForm";
import { BucketListCard } from "@/components/BucketListCard";
import { CompleteGoalModal } from "@/components/CompleteGoalModal";
import { LockButton } from "@/components/LockButton";
import type {
  BucketListItem,
  CompleteItemInput,
  NewBucketListItemInput,
} from "@/types";

export function Dashboard() {
  const { items, loading, addItem, completeItem } = useBucketListItems();
  const { addXp } = usePetState();
  const [completingItem, setCompletingItem] = useState<BucketListItem | null>(
    null
  );

  const pendingItems = items.filter((i) => i.status === "pending");
  const completedCount = items.filter((i) => i.status === "completed").length;

  const handleAddItem = async (input: NewBucketListItemInput) => {
    const result = await addItem(input);
    if (!result.error) {
      void addXp(XP_REWARDS.addGoal);
    }
    return result;
  };

  const handleComplete = async (id: string, input: CompleteItemInput) => {
    const result = await completeItem(id, input);
    if (!result.error) {
      fireGoalCompleteConfetti();
      void addXp(XP_REWARDS.completeGoal);
    }
    return result;
  };

  return (
    <main className="min-h-screen bg-blush px-4 py-6 flex flex-col items-center gap-5">
      <header className="w-full max-w-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/gallery"
            className="w-9 h-9 rounded-full bg-white border border-blush-deep flex items-center justify-center text-ink-soft"
            aria-label="Scrapbook gallery"
          >
            <Images className="w-4 h-4" />
          </Link>
          <Link
            href="/map"
            className="w-9 h-9 rounded-full bg-white border border-blush-deep flex items-center justify-center text-ink-soft"
            aria-label="Love map"
          >
            <MapIcon className="w-4 h-4" />
          </Link>
        </div>
        <LockButton />
      </header>

      <PetWidget />

      <DDayCountdown items={items} />

      <DateNightRoulette items={items} />

      <BucketListForm onSubmit={handleAddItem} />

      <div className="w-full max-w-xs flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <p className="font-display text-sm text-ink-soft">
            {pendingItems.length} to go
          </p>
          {completedCount > 0 && (
            <Link
              href="/gallery"
              className="font-body text-xs text-periwinkle underline underline-offset-2"
            >
              {completedCount} memories made →
            </Link>
          )}
        </div>

        {loading && (
          <div className="rounded-2xl bg-white border border-blush-deep h-20 animate-pulse" />
        )}

        {!loading && pendingItems.length === 0 && (
          <p className="font-body text-sm text-ink-soft text-center py-6">
            Nothing on the list yet — add your first goal above 🤍
          </p>
        )}

        <AnimatePresence>
          {pendingItems.map((item) => (
            <BucketListCard
              key={item.id}
              item={item}
              onCompleteClick={setCompletingItem}
            />
          ))}
        </AnimatePresence>
      </div>

      {completingItem && (
        <CompleteGoalModal
          item={completingItem}
          onClose={() => setCompletingItem(null)}
          onComplete={handleComplete}
        />
      )}
    </main>
  );
}
