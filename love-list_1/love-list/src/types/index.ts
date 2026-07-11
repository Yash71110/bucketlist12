export type ItemStatus = "pending" | "completed";

export interface BucketListItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  target_date: string | null; // date, e.g. "2026-12-31"
  is_priority: boolean;

  location_name: string | null;
  latitude: number | null;
  longitude: number | null;

  status: ItemStatus;
  created_by: string | null;
  completed_by: string | null;
  completed_at: string | null; // timestamptz

  image_url: string | null;
  journal_entry: string | null;

  created_at: string;
  updated_at: string;
}

export interface NewBucketListItemInput {
  title: string;
  description?: string;
  category: string;
  target_date?: string | null;
  is_priority?: boolean;
  location_name?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CompleteItemInput {
  image_url: string | null;
  journal_entry: string;
  completed_location_name?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PetState {
  id: true;
  name: string;
  xp: number;
  level: number;
  updated_at: string;
}

export const CATEGORIES = [
  "Adventure",
  "Food & Drink",
  "Travel",
  "Home",
  "Milestone",
  "Just Because",
] as const;

export type Category = (typeof CATEGORIES)[number];
