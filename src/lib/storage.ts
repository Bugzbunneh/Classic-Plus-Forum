import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Must match `allowed_mime_types` on the storage buckets (migration 0024),
// which enforces the same rules for uploads that bypass this app.
const EXTENSION_BY_IMAGE_TYPE = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/gif", "gif"],
  ["image/webp", "webp"],
]);

/** For file inputs' `accept` attribute. */
export const ACCEPTED_IMAGE_TYPES = [...EXTENSION_BY_IMAGE_TYPE.keys()].join(",");

/** True if the form field holds an actual chosen file, not an empty input. */
export function isProvidedFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

/** Returns why `file` can't be uploaded as an image, or null if it's fine. */
export function validateImage(file: File): string | null {
  if (!EXTENSION_BY_IMAGE_TYPE.has(file.type)) {
    return "That file isn't a supported image (PNG, JPEG, GIF, or WebP)";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be smaller than 5MB";
  }

  return null;
}

/** Only call after validateImage has passed. */
export function imageExtension(file: File): string {
  return EXTENSION_BY_IMAGE_TYPE.get(file.type)!;
}

export async function uploadPostImage(
  supabase: SupabaseClient,
  authorId: string,
  file: FormDataEntryValue | null,
): Promise<{ url: string | null; error: string | null }> {
  if (!isProvidedFile(file)) {
    return { url: null, error: null };
  }

  const validationError = validateImage(file);
  if (validationError) {
    return { url: null, error: validationError };
  }

  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${authorId}/${uniqueName}.${imageExtension(file)}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file, { contentType: file.type });

  if (error) {
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
