"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PetState } from "@/types";
import { getLevelInfo } from "@/lib/pet";
import { firePetLevelUpConfetti } from "@/lib/confetti";

export function usePetState() {
  const [pet, setPet] = useState<PetState | null>(null);
  const [loading, setLoading] = useState(true);
  // A fixed channel name is fragile: if this effect ever re-runs before the
  // previous channel finishes unsubscribing, Supabase's client finds one
  // already registered under that name and hands back the already-subscribed
  // instance — calling .on() on it then throws. A unique name per mount
  // makes that collision impossible.
  const [channelName] = useState(
    () => `pet_state_changes_${Math.random().toString(36).slice(2)}`
  );

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function load() {
      const { data } = await supabase
        .from("pet_state")
        .select("*")
        .eq("id", true)
        .single();
      if (isMounted && data) setPet(data as PetState);
      if (isMounted) setLoading(false);
    }
    load();

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pet_state" },
        (payload) => {
          setPet(payload.new as PetState);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [channelName]);

  const addXp = useCallback(async (amount: number) => {
    const supabase = createClient();
    // Simple read-modify-write. Last-write-wins races are a non-issue for a
    // two-person app tapping the same few actions.
    const { data: current } = await supabase
      .from("pet_state")
      .select("xp, level")
      .eq("id", true)
      .single();

    const currentXp = current?.xp ?? 0;
    const previousLevel = current?.level ?? 1;
    const newXp = currentXp + amount;
    const newLevelInfo = getLevelInfo(newXp);

    const { error } = await supabase
      .from("pet_state")
      .update({ xp: newXp, level: newLevelInfo.level })
      .eq("id", true);

    if (!error && newLevelInfo.level > previousLevel) {
      firePetLevelUpConfetti();
    }
    return { error: error?.message ?? null };
  }, []);

  return { pet, loading, addXp };
}
