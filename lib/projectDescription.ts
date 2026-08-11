/**
 * Reading a project's Tina `description` into paragraphs.
 *
 * The field is declared `rich-text`, but the published content stores it as a
 * plain string with blank-line-separated paragraphs. Both shapes are handled so
 * the viewer keeps working whichever one a given document carries.
 */

interface RichTextNode {
  type?: string;
  text?: string;
  children?: RichTextNode[];
}

/** Flatten a Tina rich-text node tree into the text of each block. */
function blocksFromAst(node: RichTextNode): string[] {
  const children = node.children ?? [];
  // A root holds blocks; anything else is treated as a single block itself.
  if (node.type === "root") {
    return children.map((child) => inlineText(child).trim()).filter(Boolean);
  }
  const own = inlineText(node).trim();
  return own ? [own] : [];
}

function inlineText(node: RichTextNode): string {
  if (typeof node.text === "string") return node.text;
  return (node.children ?? []).map(inlineText).join("");
}

/**
 * The description as a list of paragraphs, or an empty array when the project
 * has none. Never throws on an unexpected shape — an unreadable description
 * simply renders nothing.
 */
export function descriptionParagraphs(description: unknown): string[] {
  if (!description) return [];

  if (typeof description === "string") {
    return description
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+$/g, "").trim())
      .filter(Boolean);
  }

  if (typeof description === "object") {
    try {
      return blocksFromAst(description as RichTextNode);
    } catch {
      return [];
    }
  }

  return [];
}

export interface DescriptionLine {
  /** "Construction Area" for "Construction Area: 34,000 m²;" — null for prose. */
  term: string | null;
  detail: string;
}

/**
 * The studio writes these as "Label: value;" lines. Recognising that lets the
 * panel set them as a spec list instead of a wall of sentences, while anything
 * that is not in that shape still renders as an ordinary paragraph.
 */
export function descriptionLines(description: unknown): DescriptionLine[] {
  return descriptionParagraphs(description).map((paragraph) => {
    const match = /^([A-Za-z][^:\n]*):\s*([\s\S]+?)\s*;?\s*$/.exec(paragraph);
    const term = match?.[1].trim();
    // A spec label is short and headline-like. Without this, an ordinary
    // sentence with a colon in it ("The brief had one demand: keep every olive
    // tree standing") would be set as a term and a detail.
    const isLabel =
      !!term &&
      term.length <= 32 &&
      term.split(/\s+/).length <= 4 &&
      !/[.,;]/.test(term);
    if (match && isLabel) return { term: term!, detail: match[2].trim() };
    return { term: null, detail: paragraph };
  });
}

export function hasDescription(description: unknown): boolean {
  return descriptionParagraphs(description).length > 0;
}
