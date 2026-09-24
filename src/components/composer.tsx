"use client";

import { useRef, useState, type ClipboardEvent } from "react";

const EMOJIS = [
  "😀", "😂", "🤣", "😊", "😍", "🤔", "😢", "😭",
  "😡", "😴", "🥳", "😱", "👍", "👎", "🙌", "👀",
  "🎉", "🔥", "✨", "💯", "❤️", "💀", "🍻", "🏆",
  "⚔️", "🛡️", "🧙", "🐉", "🗡️", "🏹", "💰", "🎮",
];

export function Composer({
  id,
  name = "body",
  imageInputName = "image",
  defaultValue = "",
  rows = 4,
  placeholder,
  required = false,
  existingImageUrl,
  textareaClassName = "",
}: {
  id?: string;
  name?: string;
  imageInputName?: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  existingImageUrl?: string | null;
  textareaClassName?: string;
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

  return (
    <div className="flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        required={required}
        onPaste={handlePaste}
        className={`rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none ${textareaClassName}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji((s) => !s)}
            className="rounded border border-charcoal-600 px-2 py-1 text-xs text-charcoal-300 hover:text-charcoal-100"
          >
            😊 Emoji
          </button>
          {showEmoji && (
            <div className="absolute bottom-full left-0 z-10 mb-1 grid w-72 grid-cols-8 gap-1 rounded border border-charcoal-600 bg-charcoal-950 p-2 shadow-lg">
              {EMOJIS.map((emoji, i) => (
                <button
                  key={`${emoji}-${i}`}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="flex aspect-square w-full items-center justify-center rounded text-lg leading-none hover:bg-charcoal-800"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="cursor-pointer rounded border border-charcoal-600 px-2 py-1 text-xs text-charcoal-300 hover:text-charcoal-100">
          📎 {existingImageUrl ? "Replace image" : "Attach image"}
          <input
            ref={fileInputRef}
            name={imageInputName}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </label>

        <span className="text-xs text-charcoal-500">
          or paste an image right into the text box
        </span>
      </div>

      {displayImage && (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt=""
            className="max-h-24 w-fit rounded border border-charcoal-700 object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-xs text-danger-400 hover:text-danger-500"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
