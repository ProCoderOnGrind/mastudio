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
        name: "projects",
        label: "Projects",
        path: "content",
        format: "json",
        match: { include: "projects" }, // single file: content/projects.json
        ui: { allowedActions: { create: false, delete: false } }, // one singleton doc
        fields: [
          {
            type: "object",
            name: "projects",
            label: "Projects",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.name || "Untitled project" }),
            },
            fields: [
              { type: "string", name: "name", label: "Name", required: true },
              { type: "string", name: "slug", label: "Slug", required: true },
              { type: "string", name: "type", label: "Type", required: true },
              { type: "number", name: "year", label: "Year", required: true },
              { type: "string", name: "location", label: "Location", required: true },
              {
                type: "image",
                name: "images",
                label: "Photos",
                list: true,
              },
              { type: "rich-text", name: "description", label: "Description" },
              { type: "string", name: "client", label: "Client" },
              { type: "string", name: "status", label: "Status" },
              { type: "string", name: "size", label: "Size" },
            ],
          },
        ],
      },
    ],
  },
});
