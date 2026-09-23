import type { createClient } from "@/lib/supabase/server";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function uploadPostImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  authorId: string,
  file: FormDataEntryValue | null,
): Promise<{ url: string | null; error: string | null }> {
  if (!file || !(file instanceof File) || file.size === 0) {
    return { url: null, error: null };
  }

  if (!file.type.startsWith("image/")) {
    return { url: null, error: "That file isn't an image" };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { url: null, error: "Image must be smaller than 5MB" };
  }

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${authorId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file, { contentType: file.type });

  if (error) {
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
