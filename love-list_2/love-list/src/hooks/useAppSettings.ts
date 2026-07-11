"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppSettings } from "@/types";

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  // See usePetState.ts for why this is unique-per-mount rather than fixed.
  const [channelName] = useState(
    () => `app_settings_changes_${Math.random().toString(36).slice(2)}`
  );

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function load() {
      const { data } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", true)
        .single();
      if (isMounted && data) setSettings(data as AppSettings);
      if (isMounted) setLoading(false);
    }
    load();

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "app_settings" },
        (payload) => {
          setSettings(payload.new as AppSettings);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [channelName]);

  const setRelationshipStartDate = useCallback(async (dateStr: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("app_settings")
      .update({ relationship_start_date: dateStr })
      .eq("id", true);
    return { error: error?.message ?? null };
  }, []);

  return { settings, loading, setRelationshipStartDate };
}
