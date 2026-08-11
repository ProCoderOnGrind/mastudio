"use client";
import { tinaField } from "tinacms/dist/react";
import { descriptionLines } from "@/lib/projectDescription";
import type { Project } from "@/data/projects";

/**
 * The written record for a project — the Tina `description`, set as a spec list
 * where the studio wrote "Label: value" lines and as prose everywhere else.
 *
 * It sits in the photo strip as its own panel, so scrolling through a project's
 * images arrives at the text rather than hiding it behind a separate control.
 */
export default function ProjectDetails({
  project,
  variant = "desktop",
  editTarget,
}: {
  project: Project;
  variant?: "desktop" | "mobile";
  /** Raw Tina list item for click-to-edit (dev only); undefined in production. */
  editTarget?: any;
}) {
  const lines = descriptionLines(project.description);
  if (lines.length === 0) return null;

  const mobile = variant === "mobile";

  return (
    <div
      className={mobile ? "w-full" : "mx-auto w-full max-w-[720px]"}
      data-tina-field={editTarget ? tinaField(editTarget, "description") : undefined}
    >
      <div className="label meta">About the project</div>
      <h2
        className={`mt-2 uppercase leading-none ${
          mobile ? "text-[26px]" : "text-[clamp(24px,2.6vw,40px)]"
        }`}
      >
        {project.name}
      </h2>
      <div className="label meta mt-2">
        {project.location} · {project.type} · {project.year}
      </div>

      <dl className="mt-7 border-t border-hairline">
        {lines.map((line, i) =>
          line.term ? (
            <div
              key={i}
              className={`grid gap-x-6 gap-y-1 border-b border-hairline py-3 ${
                mobile ? "grid-cols-1" : "md:grid-cols-[13rem_1fr]"
              }`}
            >
              <dt className="label meta">{line.term}</dt>
              <dd className="text-[15px] leading-relaxed">{line.detail}</dd>
            </div>
          ) : (
            <div key={i} className="border-b border-hairline py-3">
              {/* Prose paragraph: no term, so it spans the full width. */}
              <dd className="text-[15px] leading-relaxed whitespace-pre-line">{line.detail}</dd>
            </div>
          ),
        )}
      </dl>
    </div>
  );
}
