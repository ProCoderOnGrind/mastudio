import { describe, it, expect } from "vitest";
import {
  descriptionParagraphs,
  descriptionLines,
  hasDescription,
} from "@/lib/projectDescription";

// The shape the published content actually uses.
const PUBLISHED =
  "Program: Shopping mall, online retail service;\n\n" +
  "Construction Area: 34,000 m²;\n\n" +
  "Actual Status: Construction permit stage.\n";

// The shape a Tina rich-text field serialises to.
const RICH_TEXT = {
  type: "root",
  children: [
    { type: "p", children: [{ type: "text", text: "A courtyard house on a steep site." }] },
    {
      type: "p",
      children: [
        { type: "text", text: "Client: " },
        { type: "text", text: "Private", bold: true },
      ],
    },
  ],
};

describe("descriptionParagraphs", () => {
  it("splits a plain string on blank lines", () => {
    expect(descriptionParagraphs(PUBLISHED)).toEqual([
      "Program: Shopping mall, online retail service;",
      "Construction Area: 34,000 m²;",
      "Actual Status: Construction permit stage.",
    ]);
  });

  it("flattens a Tina rich-text tree, including nested marks", () => {
    expect(descriptionParagraphs(RICH_TEXT)).toEqual([
      "A courtyard house on a steep site.",
      "Client: Private",
    ]);
  });

  it("treats missing, empty and unusable values as no description", () => {
    expect(descriptionParagraphs(undefined)).toEqual([]);
    expect(descriptionParagraphs(null)).toEqual([]);
    expect(descriptionParagraphs("")).toEqual([]);
    expect(descriptionParagraphs("   \n\n  ")).toEqual([]);
    expect(descriptionParagraphs(42)).toEqual([]);
    expect(descriptionParagraphs({ nonsense: true })).toEqual([]);
  });
});

describe("descriptionLines", () => {
  it("reads 'Label: value;' lines as term and detail", () => {
    const lines = descriptionLines(PUBLISHED);
    expect(lines[0]).toEqual({ term: "Program", detail: "Shopping mall, online retail service" });
    expect(lines[1]).toEqual({ term: "Construction Area", detail: "34,000 m²" });
  });

  it("keeps the trailing full stop on prose-style values", () => {
    expect(descriptionLines("Actual Status: Construction permit stage.")).toEqual([
      { term: "Actual Status", detail: "Construction permit stage." },
    ]);
  });

  it("leaves an ordinary sentence as a paragraph", () => {
    expect(descriptionLines("A courtyard house on a steep site.")).toEqual([
      { term: null, detail: "A courtyard house on a steep site." },
    ]);
  });

  it("does not mistake a mid-sentence colon for a label", () => {
    const long = "The brief had one demand: keep every olive tree on the plot standing.";
    expect(descriptionLines(long)[0].term).toBeNull();
  });
});

describe("hasDescription", () => {
  it("is true only when there is something to show", () => {
    expect(hasDescription(PUBLISHED)).toBe(true);
    expect(hasDescription(RICH_TEXT)).toBe(true);
    expect(hasDescription("")).toBe(false);
    expect(hasDescription(undefined)).toBe(false);
  });
});
