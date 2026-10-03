"use client";

import { useRef, useState, type ClipboardEvent } from "react";
import { ImagePlus, Smile, X } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/storage";

const EMOJIS = [
  "😀", "😂", "🤣", "😊", "😍", "🤔", "😢", "😭",
  "😡", "😴", "🥳", "😱", "👍", "👎", "🙌", "👀",
  "🎉", "🔥", "✨", "💯", "❤️", "💀", "🍻", "🏆",
  "⚔️", "🛡️", "🧙", "🐉", "🗡️", "🏹", "💰", "🎮",
];

const TOOL_BUTTON_CLASS =
  "flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-charcoal-400 transition-[background-color,color,transform] duration-200 ease-spring hover:bg-white/5 hover:text-gold-300 active:scale-90";

/**
 * A textarea with an emoji picker and image attachment (browse or paste),
 * styled as one framed box that glows while you're typing in it.
 */
export function Composer({
  id,
  name = "body",
  imageInputName = "image",
  defaultValue = "",
  rows = 4,
  placeholder,
  required = false,
  existingImageUrl,
}: {
  id?: string;
  name?: string;
  imageInputName?: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  existingImageUrl?: string | null;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const displayImage = preview ?? existingImageUrl ?? null;

  function insertEmoji(emoji: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    textarea.value = textarea.value.slice(0, start) + emoji + textarea.value.slice(end);

    const cursor = start + emoji.length;
    textarea.focus();
    textarea.setSelectionRange(cursor, cursor);
    setShowEmoji(false);
  }

  function attachFile(file: File) {
    if (!fileInputRef.current) return;
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInputRef.current.files = dataTransfer.files;
    setPreview(URL.createObjectURL(file));
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          attachFile(file);
        }
        break;
      }
    }
  }

  function removeImage() {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col rounded-xl border border-charcoal-700 bg-charcoal-975/70 shadow-[inset_0_2px_6px_rgb(0_0_0/0.4)] transition-[border-color,box-shadow] duration-200 focus-within:border-green-500 focus-within:shadow-[inset_0_2px_6px_rgb(0_0_0/0.4),0_0_0_3px_rgb(79_184_114/0.2),0_0_28px_-6px_rgb(79_184_114/0.5)] hover:border-charcoal-600 focus-within:hover:border-green-500">
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        required={required}
        onPaste={handlePaste}
        className="resize-y rounded-t-xl bg-transparent px-4 py-3 leading-relaxed text-charcoal-100 placeholder:text-charcoal-500 focus:outline-none"
      />

      {displayImage && (
        <div className="px-4 pb-3">
          <div className="group/preview relative w-fit animate-rise-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImage}
              alt="Attached image preview"
              className="max-h-28 w-fit rounded-lg border border-charcoal-700 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove image"
              className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border border-charcoal-600 bg-charcoal-900 text-charcoal-300 shadow-lg transition-[transform,color,background-color] duration-200 ease-spring hover:scale-110 hover:bg-danger-600 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1 border-t border-charcoal-800 px-2 py-1.5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji((shown) => !shown)}
            aria-expanded={showEmoji}
            className={TOOL_BUTTON_CLASS}
          >
            <Smile className="size-4" aria-hidden="true" />
            Emoji
          </button>
          {showEmoji && (
            <div className="wow-tooltip absolute bottom-full left-0 z-20 mb-2 grid w-72 origin-bottom-left animate-[emoji-pop_220ms_var(--ease-spring)] grid-cols-8 gap-1 p-2">
              {EMOJIS.map((emoji, i) => (
                <button
                  key={`${emoji}-${i}`}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="flex aspect-square w-full items-center justify-center rounded-md text-lg leading-none transition-transform duration-200 ease-spring hover:scale-125 hover:bg-white/10 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className={TOOL_BUTTON_CLASS}>
          <ImagePlus className="size-4" aria-hidden="true" />
          {existingImageUrl ? "Replace image" : "Attach image"}
          <input
            ref={fileInputRef}
            name={imageInputName}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </label>

        <span className="ml-auto hidden pr-2 text-xs text-charcoal-500 sm:inline">
          Paste images straight in · **bold** · *italic*
        </span>
      </div>
    </div>
  );
}
