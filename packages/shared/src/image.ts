interface ImageOptions {
  width?: number;
  height?: number;
  format?: "webp" | "avif" | "jpeg" | "png";
  quality?: number;
  fit?: "cover" | "contain" | "scale-down";
}

/**
 * Build an optimized image URL using Cloudflare Image Transformations.
 * Appends width/height/format/quality params for on-the-fly processing.
 */
export function optimizedImageUrl(url: string, opts: ImageOptions = {}): string {
  if (!url) return url;

  const params = new URLSearchParams();
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  if (opts.format) params.set("format", opts.format);
  if (opts.quality) params.set("quality", String(opts.quality));
  if (opts.fit) params.set("fit", opts.fit);

  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}
