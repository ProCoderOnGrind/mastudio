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
      {
        name: "about",
        label: "About",
        path: "content",
        format: "json",
        match: { include: "about" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object", name: "sections", label: "Sections", list: true,
            ui: { itemProps: (i: { title?: string }) => ({ label: i?.title || "Section" }) },
            fields: [
              { type: "string", name: "title", label: "Title" },
              { type: "string", name: "body", label: "Body paragraphs", list: true, ui: { component: "textarea" } },
              { type: "string", name: "items", label: "Items", list: true },
              {
                type: "object", name: "subsections", label: "Subsections", list: true,
                ui: { itemProps: (i: { title?: string }) => ({ label: i?.title || "Subsection" }) },
                fields: [
                  { type: "string", name: "title", label: "Title" },
                  { type: "string", name: "body", label: "Body paragraphs", list: true, ui: { component: "textarea" } },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "cofounders",
        label: "Cofounders",
        path: "content",
        format: "json",
        match: { include: "cofounders" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object", name: "founders", label: "Founders", list: true,
            ui: { itemProps: (i: { name?: string }) => ({ label: i?.name || "Founder" }) },
            fields: [
              { type: "string", name: "name", label: "Name" },
              { type: "string", name: "role", label: "Role" },
              { type: "string", name: "bio", label: "Bio paragraphs", list: true, ui: { component: "textarea" } },
              { type: "image", name: "image", label: "Photo" },
            ],
          },
        ],
      },
    ],
  },
});
