import { PROJECTS } from "@/data/projects";
import { categoryLabel } from "@/data/categories";

export interface SearchResult {
  label: string;
  href: string;
  sub?: string;
}

/**
 * One searchable project. `label` is the name (weighted heaviest) and `extra`
 * everything else worth matching on — location, type, year, category. Searching
 * "hotel", "durres" or "2021" all land on the same project.
 */
interface Entry extends SearchResult {
  extra: string[];
  year: number;
}

function entries(): Entry[] {
  return PROJECTS.map((p) => ({
    label: p.name,
    href: `/projects/${p.slug}`,
    sub: p.location,
    year: p.year,
    extra: [p.location, p.type, String(p.year), categoryLabel(p.category), p.slug.replace(/-/g, " ")],
  }));
}

/** How many projects the panel offers before anything has been typed. */
export const RECENT_COUNT = 6;

/**
 * The newest projects, for the empty field. Sorted by year, newest first;
 * projects sharing a year keep their order in the collection, which is the
 * studio's own ordering.
 */
export function recentProjects(limit: number = RECENT_COUNT): SearchResult[] {
  return entries()
    .map((e, i) => ({ e, i }))
    .sort((a, b) => b.e.year - a.e.year || a.i - b.i)
    .slice(0, limit)
    .map(({ e }) => toResult(e));
}

/**
 * Damerau-Levenshtein (optimal string alignment), abandoned as soon as it can
 * only exceed `max`. Transpositions count as one edit rather than two, because
 * "germai" for "germia" is the typo people actually make.
 */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  // twoBack is the row two above, needed for the transposition case.
  let twoBack: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d = Math.min(d, twoBack[j - 2] + 1);
      }
      curr.push(d);
      if (d < rowMin) rowMin = d;
    }
    if (rowMin > max) return max + 1;
    twoBack = prev;
    prev = curr;
  }
  return prev[b.length];
}

/**
 * How many single-character typos a token of this length may carry. Short
 * tokens get none: at 3 characters almost every word is one edit away from
 * every other, which turns the field into a random project picker.
 */
function typoBudget(token: string): number {
  if (token.length >= 7) return 2;
  if (token.length >= 4) return 1;
  return 0;
}

function words(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean);
}

/**
 * Score one token against one field. 0 means no match at all — the caller
 * treats that as disqualifying, so every typed word has to land somewhere.
 */
function scoreField(token: string, field: string, weight: number): number {
  const lower = field.toLowerCase();
  if (!lower) return 0;
  if (lower === token) return weight * 10;
  if (lower.startsWith(token)) return weight * 6;

  const parts = words(lower);
  if (parts.some((w) => w.startsWith(token))) return weight * 4;
  if (lower.includes(token)) return weight * 3;

  // Nothing matched literally, so allow a near-miss: "residentail",
  // "germai", "conctret" still find their project.
  const budget = typoBudget(token);
  if (budget === 0) return 0;
  let best = budget + 1;
  for (const w of parts) {
    // Compare against a same-length window too, so a typo inside a longer
    // word ("hospitalty" vs "hospitality") is still reachable.
    const d = Math.min(
      editDistance(token, w, budget),
      w.length > token.length ? editDistance(token, w.slice(0, token.length), budget) : budget + 1,
    );
    if (d < best) best = d;
  }
  if (best > budget) return 0;
  return Math.max(1, weight - best * 3);
}

/** Best score for a token across an entry's fields, or 0 if it matches none. */
function scoreEntry(token: string, entry: Entry): number {
  let best = scoreField(token, entry.label, 10);
  for (const field of entry.extra) {
    const s = scoreField(token, field, 4);
    if (s > best) best = s;
  }
  return best;
}

const MAX_RESULTS = 24;

/**
 * Ordinary substring-first search over the projects.
 *
 * Multi-word queries are AND-ed: "villa tirana" only keeps projects that match
 * both words, which is what people expect when they add a word to narrow a
 * list. An empty query returns the most recent projects, so the panel is
 * useful before anything is typed.
 */
export function searchAll(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return recentProjects();

  const tokens = q.split(/\s+/).filter(Boolean);

  const scored: { entry: Entry; score: number }[] = [];
  for (const entry of entries()) {
    let total = 0;
    let matchedAll = true;
    for (const token of tokens) {
      const s = scoreEntry(token, entry);
      if (s === 0) {
        matchedAll = false;
        break;
      }
      total += s;
    }
    if (!matchedAll) continue;
    // Whole-query hit on the name beats any sum of per-word hits.
    if (entry.label.toLowerCase().includes(q)) total += 40;
    // Shorter names are the more exact answer for the same match quality.
    total += Math.max(0, 30 - entry.label.length) / 10;
    scored.push({ entry, score: total });
  }

  scored.sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label));
  return scored.slice(0, MAX_RESULTS).map((s) => toResult(s.entry));
}

function toResult(entry: Entry): SearchResult {
  const { label, href, sub } = entry;
  return { label, href, ...(sub ? { sub } : {}) };
}

/**
 * Split `label` into alternating plain / matched segments for the query, so the
 * dropdown can bold what the visitor actually typed. Only whole tokens that
 * appear literally are highlighted; fuzzy hits stay unmarked rather than
 * highlighting the wrong letters.
 */
export function highlightSegments(
  label: string,
  query: string,
): { text: string; match: boolean }[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [{ text: label, match: false }];

  const lower = label.toLowerCase();
  const hits: [number, number][] = [];
  for (const token of tokens) {
    let from = 0;
    for (;;) {
      const at = lower.indexOf(token, from);
      if (at === -1) break;
      hits.push([at, at + token.length]);
      from = at + token.length;
    }
  }
  if (hits.length === 0) return [{ text: label, match: false }];

  hits.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of hits) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }

  const out: { text: string; match: boolean }[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) out.push({ text: label.slice(cursor, start), match: false });
    out.push({ text: label.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < label.length) out.push({ text: label.slice(cursor), match: false });
  return out;
}
