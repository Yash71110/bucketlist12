"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  BucketListItem,
  CompleteItemInput,
  NewBucketListItemInput,
} from "@/types";

export function useBucketListItems() {
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  // See usePetState.ts for why this is unique-per-mount rather than fixed.
  const [channelName] = useState(
    () => `bucket_list_items_changes_${Math.random().toString(36).slice(2)}`
  );

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function load() {
      const { data, error } = await supabase
        .from("bucket_list_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (isMounted && !error && data) {
        setItems(data as BucketListItem[]);
      }
      if (isMounted) setLoading(false);
    }
    load();

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bucket_list_items" },
        (payload) => {
          setItems((current) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as BucketListItem;
              if (current.some((i) => i.id === row.id)) return current;
              return [row, ...current];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as BucketListItem;
              return current.map((i) => (i.id === row.id ? row : i));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as { id: string };
              return current.filter((i) => i.id !== row.id);
            }
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [channelName]);

  const addItem = useCallback(async (input: NewBucketListItemInput) => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("bucket_list_items").insert({
      title: input.title,
      description: input.description ?? null,
      category: input.category,
      target_date: input.target_date ?? null,
      is_priority: input.is_priority ?? false,
      location_name: input.location_name ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      created_by: userData.user?.id ?? null,
    });
    return { error: error?.message ?? null };
  }, []);

  const completeItem = useCallback(
    async (id: string, input: CompleteItemInput) => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      const patch: Record<string, unknown> = {
        status: "completed",
        completed_at: new Date().toISOString(),
        completed_by: userData.user?.id ?? null,
        image_url: input.image_url,
        journal_entry: input.journal_entry,
      };
      if (input.completed_location_name !== undefined) {
        patch.location_name = input.completed_location_name;
      }
      if (input.latitude !== undefined) patch.latitude = input.latitude;
      if (input.longitude !== undefined) patch.longitude = input.longitude;

      const { error } = await supabase
        .from("bucket_list_items")
        .update(patch)
        .eq("id", id);
      return { error: error?.message ?? null };
    },
    []
  );

  const deleteItem = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("bucket_list_items")
      .delete()
      .eq("id", id);
    return { error: error?.message ?? null };
  }, []);

  const reactToItem = useCallback(async (id: string, emoji: string) => {
    const supabase = createClient();
    const { error } = await supabase.rpc("increment_reaction", {
      item_id: id,
      emoji,
    });
    return { error: error?.message ?? null };
  }, []);

  return { items, loading, addItem, completeItem, deleteItem, reactToItem };
}
