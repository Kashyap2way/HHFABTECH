"use client";

/**
 * Sanity Studio, embedded in the site at /studio (src/app/studio/[[...tool]]/page.tsx).
 * Editors sign in with their Sanity account; add the site origin under
 * sanity.io/manage → API → CORS origins (with credentials) for each environment.
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

/** Documents created only by website forms, never from the Studio "+" menu. */
const FORM_TYPES = new Set(["jobApplication", "inquiry"]);

export default defineConfig({
  name: "hhfabtech",
  title: "HH FABTECH",
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Applications are only created by the website, never from the "+" menu.
    templates: (prev) => prev.filter((t) => !FORM_TYPES.has(t.schemaType)),
  },
  document: {
    // Hide "Duplicate" / "Create" style actions for applications.
    actions: (prev, ctx) =>
      FORM_TYPES.has(ctx.schemaType)
        ? prev.filter((a) => a.action !== "duplicate")
        : prev,
    newDocumentOptions: (prev) =>
      prev.filter((item) => !FORM_TYPES.has(item.templateId)),
  },
  plugins: [
    structureTool({ structure }),
    // GROQ playground for admins. Pinned to the same API version as the site.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
