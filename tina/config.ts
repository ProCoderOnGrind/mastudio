import { defineConfig } from "tinacms";

// Local-only when these are unset (clientId/token null -> `tinacms ... --local`).
// On a host (e.g. Vercel) set NEXT_PUBLIC_TINA_CLIENT_ID + TINA_TOKEN to enable
// the hosted Tina Cloud admin, which commits edits to the connected Git branch.
export default defineConfig({
  // On Vercel, VERCEL_GIT_COMMIT_REF is the deployed branch automatically.
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "master",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
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
        name: "posts",
        label: "Blog",
        path: "content",
        format: "json",
        match: { include: "posts" }, // single file: content/posts.json
        ui: { allowedActions: { create: false, delete: false } }, // one singleton doc
        fields: [
          {
            type: "object",
            name: "posts",
            label: "Posts",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.title || "Untitled post" }),
            },
            fields: [
              { type: "string", name: "title", label: "Title", required: true },
              { type: "string", name: "slug", label: "Slug", required: true },
              { type: "string", name: "date", label: "Date (YYYY-MM-DD)", required: true },
              {
                type: "string",
                name: "category",
                label: "Category",
                required: true,
                options: [
                  { value: "news", label: "News" },
                  { value: "events", label: "Events" },
                  { value: "awards", label: "Awards" },
                  { value: "lectures", label: "Lectures" },
                ],
              },
              { type: "string", name: "excerpt", label: "Excerpt", ui: { component: "textarea" } },
              {
                type: "object",
                name: "source",
                label: "Source link",
                fields: [
                  { type: "string", name: "label", label: "Label" },
                  { type: "string", name: "url", label: "URL" },
                ],
              },
              { type: "image", name: "image", label: "Featured image" },
              {
                type: "string",
                name: "video",
                label: "YouTube video (optional)",
                description:
                  "Paste any YouTube link — watch, youtu.be, embed or shorts. The featured image then carries a play button and opens the video on YouTube.",
              },
              {
                type: "object",
                name: "article",
                label: "Article",
                list: true,
                description:
                  "The article that opens when someone clicks this entry. Add Text and Image blocks in any order — they appear in the order listed here. Adding any block gives the post its own page at /blog/<slug> and a sitemap entry.",
                templates: [
                  {
                    name: "text",
                    label: "Text",
                    ui: {
                      itemProps: (item: { text?: string }) => ({
                        label: item?.text?.slice(0, 60) || "Text",
                      }),
                    },
                    fields: [
                      {
                        type: "string",
                        name: "text",
                        label: "Paragraph",
                        required: true,
                        ui: { component: "textarea" },
                      },
                    ],
                  },
                  {
                    name: "image",
                    label: "Image",
                    ui: {
                      itemProps: (item: { caption?: string }) => ({
                        label: item?.caption || "Image",
                      }),
                    },
                    fields: [
                      { type: "image", name: "src", label: "Image", required: true },
                      { type: "string", name: "caption", label: "Caption (optional)" },
                    ],
                  },
                ],
              },
              {
                type: "image",
                name: "videoImage",
                label: "Video cover image",
                description:
                  "Shown at the end of the article with a YouTube play button over it; clicking it opens the video above. Leave empty to use YouTube's own thumbnail.",
              },
              {
                type: "string",
                name: "body",
                label: "Article body (old format)",
                list: true,
                ui: { component: "textarea" },
                description:
                  "Superseded by Article above, which also takes images. Existing posts still render from here; new ones should use Article.",
              },
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
      {
        name: "contact",
        label: "Contact",
        path: "content",
        format: "json",
        match: { include: "contact" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object", name: "offices", label: "Offices", list: true,
            ui: { itemProps: (i: { city?: string }) => ({ label: i?.city || "Office" }) },
            fields: [
              { type: "string", name: "city", label: "City" },
              { type: "string", name: "label", label: "Label" },
              { type: "string", name: "address", label: "Address lines", list: true },
              { type: "string", name: "email", label: "Email" },
              { type: "string", name: "phone", label: "Phone" },
            ],
          },
          {
            type: "object", name: "socials", label: "Socials", list: true,
            ui: { itemProps: (i: { label?: string }) => ({ label: i?.label || "Social" }) },
            fields: [
              { type: "string", name: "label", label: "Label" },
              { type: "string", name: "href", label: "URL" },
            ],
          },
          { type: "string", name: "services", label: "Services", list: true },
        ],
      },
    ],
  },
});
