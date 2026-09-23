import { describe, expect, it, vi } from "vitest";
import { uploadPostImage } from "./storage";

function fakeSupabase(uploadResult: { error: { message: string } | null }) {
  return {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue(uploadResult),
        getPublicUrl: () => ({ data: { publicUrl: "https://example.com/image.png" } }),
      }),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("uploadPostImage", () => {
  it("returns no url/error when no file is provided", async () => {
    const result = await uploadPostImage(fakeSupabase({ error: null }), "user-1", null);
    expect(result).toEqual({ url: null, error: null });
  });

  it("returns no url/error for an empty file input", async () => {
    const emptyFile = new File([], "");
    const result = await uploadPostImage(fakeSupabase({ error: null }), "user-1", emptyFile);
    expect(result).toEqual({ url: null, error: null });
  });

  it("rejects non-image files", async () => {
    const file = new File(["not an image"], "notes.txt", { type: "text/plain" });
    const result = await uploadPostImage(fakeSupabase({ error: null }), "user-1", file);
    expect(result.url).toBeNull();
    expect(result.error).toMatch(/isn't an image/i);
  });

  it("rejects files over 5MB", async () => {
    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png", {
      type: "image/png",
    });
    const result = await uploadPostImage(fakeSupabase({ error: null }), "user-1", oversized);
    expect(result.url).toBeNull();
    expect(result.error).toMatch(/5MB/);
  });

  it("uploads a valid image and returns its public url", async () => {
    const file = new File(["fake image bytes"], "avatar.png", { type: "image/png" });
    const result = await uploadPostImage(fakeSupabase({ error: null }), "user-1", file);
    expect(result).toEqual({ url: "https://example.com/image.png", error: null });
  });

  it("surfaces a storage upload error", async () => {
    const file = new File(["fake image bytes"], "avatar.png", { type: "image/png" });
    const result = await uploadPostImage(
      fakeSupabase({ error: { message: "storage is on fire" } }),
      "user-1",
      file,
    );
    expect(result).toEqual({ url: null, error: "storage is on fire" });
  });
});
