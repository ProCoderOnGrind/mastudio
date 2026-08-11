/**
 * YouTube link helpers for editorial content.
 *
 * Editors paste whatever YouTube hands them — a watch URL, a `youtu.be` share
 * link, an embed/shorts/live URL, or sometimes just the bare id. Everything is
 * normalised down to the 11-character video id so the UI can build one
 * canonical watch URL and a stable thumbnail, and so a typo'd link degrades to
 * "no video" rather than a broken outbound link.
 */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
]);

/** Path forms that carry the id as the first segment after the prefix. */
const PATH_ID = /^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})(?:[/?#]|$)/;

/**
 * Extracts the video id from any common YouTube link, or `null` when the input
 * is empty, malformed, or not a YouTube URL at all.
 */
export function youtubeId(input?: string | null): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;

  // A bare id, pasted straight from the address bar's `v=` parameter.
  if (VIDEO_ID.test(raw)) return raw;

  let url: URL;
  try {
    // Tolerate a scheme-less paste like "youtu.be/abc...".
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return VIDEO_ID.test(id) ? id : null;
  }

  if (!HOSTS.has(host)) return null;

  const v = url.searchParams.get("v");
  if (v && VIDEO_ID.test(v)) return v;

  const fromPath = PATH_ID.exec(url.pathname);
  return fromPath ? fromPath[1] : null;
}

/** Canonical watch URL for a video, or `null` if the input isn't a video link. */
export function youtubeWatchUrl(input?: string | null): string | null {
  const id = youtubeId(input);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

/**
 * Schema.org `embedUrl` for VideoObject markup — search engines want the
 * player URL, not the watch page.
 */
export function youtubeEmbedUrl(input?: string | null): string | null {
  const id = youtubeId(input);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

/** Public thumbnail for a video, used as the poster frame in structured data. */
export function youtubeThumbnail(input?: string | null): string | null {
  const id = youtubeId(input);
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : null;
}
