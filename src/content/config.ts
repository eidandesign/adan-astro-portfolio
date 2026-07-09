import { defineCollection, z } from "astro:content";

/**
 * Case studies collection — the site's CMS.
 *
 * To publish a new project: copy an existing .md file in
 * src/content/case-studies/, edit the frontmatter, and drop images in
 * public/images/case-studies/<slug>/. It appears on the homepage and gets
 * its own page automatically.
 *
 * kind: "case-study" → full case study at /case-studies/<slug>
 *       (homepage "Case Studies" section)
 * kind: "work"       → lighter project page at /portfolio/<slug>
 *       (homepage "Work" cards)
 */
const caseStudies = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    kind: z.enum(["case-study", "work"]).default("case-study"),
    order: z.number().default(99),
    subtitle: z.string().optional(),
    description: z.string(),
    heroImage: z.string(),
    cardImage: z.string().optional(),
    cardLabels: z.string().optional(),
    tags: z.array(z.string()).default([]),
    role: z.string().optional(),
    team: z.string().optional(),
    tech: z.string().optional(),
    improvement: z.string().optional(),
    overview: z.string().optional(),
    data: z
      .array(
        z.object({
          icon: z.enum(["users", "keys", "goal", "analytics"]).optional(),
          label: z.string(),
          text: z.string(),
        })
      )
      .default([]),
    exploration: z
      .object({
        title: z.string().default("Exploration"),
        text: z.string(),
        images: z.array(z.string()),
      })
      .optional(),
    design: z
      .object({
        title: z.string().default("User Interface"),
        text: z.string(),
        images: z.array(z.string()),
      })
      .optional(),
    prototype: z
      .object({
        text: z.string(),
        url: z.string(),
        label: z.string().default("View Prototype"),
      })
      .optional(),
    results: z
      .array(z.object({ label: z.string(), value: z.string(), text: z.string() }))
      .default([]),
    conclusions: z.array(z.object({ label: z.string(), text: z.string() })).default([]),
    gallery: z.array(z.string()).default([]),
    figma: z
      .object({
        text: z.string().default("Do you want to see the full project?"),
        url: z.string(),
        label: z.string().default("View Figma file"),
      })
      .optional(),
  }),
});

export const collections = { "case-studies": caseStudies };
