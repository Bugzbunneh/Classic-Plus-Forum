/** An attached image; opens full size in a new tab, and zooms slightly on hover. */
export function PostImage({ url, maxHeightClass }: { url: string; maxHeightClass: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group/image block w-fit max-w-full overflow-hidden rounded-lg border border-charcoal-700 transition-[border-color,box-shadow] duration-300 hover:border-gold-700 hover:shadow-[0_0_24px_-8px_rgb(224_189_94/0.5)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Attached image"
        className={`w-fit max-w-full object-contain transition-transform duration-500 ease-out-expo group-hover/image:scale-[1.03] ${maxHeightClass}`}
      />
    </a>
  );
}
