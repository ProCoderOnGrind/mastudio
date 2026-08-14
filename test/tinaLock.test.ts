import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// TinaCloud indexes a branch from the committed `tina/tina-lock.json`, not from
// `tina/config.ts`. The lock is only rewritten by `tinacms dev` — `tinacms build`,
// which is what `pnpm build` and Vercel run, leaves it alone. So a schema change
// committed without a local dev run leaves TinaCloud's GraphQL schema a step
// behind the admin bundle built from the config, and every save in /admin fails
// with a schema mismatch. That has now bitten twice (07419ef, 6990bfc).
//
// To fix a failure here: run `npx tinacms dev`, stop it once it reports the API
// url, and commit the regenerated `tina/tina-lock.json`.

const root = path.resolve(__dirname, "..");
const readJSON = (rel: string) => JSON.parse(readFileSync(path.join(root, rel), "utf8"));

const lock = readJSON("tina/tina-lock.json");

type Field = { name: string; fields?: Field[] };
type Collection = { name: string; fields: Field[] };

describe("tina-lock.json stays in step with the schema", () => {
  it("declares every field the content files actually use", () => {
    for (const collection of lock.schema.collections as Collection[]) {
      const file = `content/${collection.name}.json`;
      if (!existsSync(path.join(root, file))) continue;

      // Each collection wraps its entries in a single object-list field.
      const wrapper = collection.fields[0];
      const declared = new Set((wrapper.fields ?? []).map((f) => f.name));
      const entries = readJSON(file)[wrapper.name];
      if (!Array.isArray(entries)) continue;

      const used = new Set<string>();
      for (const entry of entries) Object.keys(entry).forEach((k) => used.add(k));

      const undeclared = [...used].filter((k) => !declared.has(k));
      expect(
        undeclared,
        `${file} uses ${undeclared.join(", ")}, which tina-lock.json does not declare — ` +
          `regenerate the lock with \`npx tinacms dev\` and commit it`,
      ).toEqual([]);
    }
  });

  it("matches the schema generated from tina/config.ts", () => {
    // __generated__ is gitignored, so this only runs after a build or dev run —
    // which is exactly when the schema could have drifted.
    const generated = "tina/__generated__/_schema.json";
    if (!existsSync(path.join(root, generated))) return;
    expect(lock.schema).toEqual(readJSON(generated));
  });
});
