import { createClient } from "@/lib/supabase/client";

export async function uploadMemoryImage(
  file: File,
  itemId: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${itemId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("bucket-list-memories")
    .upload(path, file, { upsert: true, cacheControl: "3600" });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage
    .from("bucket-list-memories")
    .getPublicUrl(path);

  return { url: data.publicUrl, error: null };
}
