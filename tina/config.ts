import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "master",
  clientId: null, // local-only, no Tina Cloud
  token: null,
  build: { outputFolder: "admin", publicFolder: "public" },
  media: {
    tina: { mediaRoot: "", publicFolder: "public" },
  },
  schema: {
    collections: [
      {
        name: "smoke",
        label: "Smoke Test",
        path: "content/smoke",
        format: "json",
        fields: [{ type: "string", name: "title", label: "Title" }],
      },
    ],
  },
});
