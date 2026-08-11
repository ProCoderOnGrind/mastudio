import { describe, it, expect } from "vitest";
import {
  youtubeId,
  youtubeWatchUrl,
  youtubeEmbedUrl,
  youtubeThumbnail,
} from "@/lib/youtube";

const ID = "aqz-KE-bpKQ";

describe("youtubeId", () => {
  it("reads the id from every link form an editor is likely to paste", () => {
    expect(youtubeId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(youtubeId(`https://youtube.com/watch?v=${ID}&t=42s`)).toBe(ID);
    expect(youtubeId(`https://m.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(youtubeId(`https://youtu.be/${ID}`)).toBe(ID);
    expect(youtubeId(`https://youtu.be/${ID}?t=10`)).toBe(ID);
    expect(youtubeId(`https://www.youtube.com/embed/${ID}`)).toBe(ID);
    expect(youtubeId(`https://www.youtube.com/shorts/${ID}`)).toBe(ID);
    expect(youtubeId(`https://www.youtube.com/live/${ID}`)).toBe(ID);
    expect(youtubeId(`https://www.youtube-nocookie.com/embed/${ID}`)).toBe(ID);
  });

  it("accepts a bare id and a scheme-less paste", () => {
    expect(youtubeId(ID)).toBe(ID);
    expect(youtubeId(`youtu.be/${ID}`)).toBe(ID);
    expect(youtubeId(`  ${ID}  `)).toBe(ID);
  });

  it("returns null for empty, malformed and non-YouTube input", () => {
    expect(youtubeId(undefined)).toBeNull();
    expect(youtubeId(null)).toBeNull();
    expect(youtubeId("")).toBeNull();
    expect(youtubeId("   ")).toBeNull();
    expect(youtubeId("not a url")).toBeNull();
    expect(youtubeId("https://vimeo.com/123456")).toBeNull();
    expect(youtubeId("https://www.youtube.com/@mastudiopartners")).toBeNull();
    expect(youtubeId("https://www.youtube.com/watch?v=tooshort")).toBeNull();
  });
});

describe("youtube URL builders", () => {
  it("normalise any input form to one canonical watch URL", () => {
    expect(youtubeWatchUrl(`https://youtu.be/${ID}?t=10`)).toBe(
      `https://www.youtube.com/watch?v=${ID}`,
    );
  });

  it("build embed and thumbnail URLs for structured data", () => {
    expect(youtubeEmbedUrl(ID)).toBe(`https://www.youtube.com/embed/${ID}`);
    expect(youtubeThumbnail(ID)).toBe(`https://i.ytimg.com/vi/${ID}/maxresdefault.jpg`);
  });

  it("return null rather than a broken link when the input is not a video", () => {
    expect(youtubeWatchUrl("https://vimeo.com/123456")).toBeNull();
    expect(youtubeEmbedUrl(undefined)).toBeNull();
    expect(youtubeThumbnail("")).toBeNull();
  });
});
