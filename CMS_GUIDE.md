# Publishing case studies (the CMS)

All projects live as Markdown files in **`src/content/case-studies/`**. No external service — the files are the CMS. Adding a file publishes it: the homepage cards and the project page are generated automatically.

## Add a new case study

1. Copy an existing file:
   - **`stanza.md`** → full case study (`kind: case-study`) — gets a page at `/case-studies/<file-name>` and a card in the homepage **Case Studies** section.
   - **`tasketeer.md`** → lighter project page (`kind: work`) — gets a page at `/portfolio/<file-name>` and a card in the homepage **Work** section.
2. Rename it — the file name becomes the URL slug (`my-project.md` → `/case-studies/my-project`).
3. Drop images into `public/images/case-studies/<slug>/` and reference them in the frontmatter.
4. Edit the frontmatter fields. Every section is optional — remove `exploration:`, `prototype:`, `results:`, etc. if the project doesn't need them, and the page section disappears.
5. `order:` controls the position on the homepage (1 = first). `data:` icons can be `users`, `keys`, `goal`, or `analytics` (animated Lottie icons in `public/lottie/`).

That's it. Run `npm run dev` to preview, `npm run build` to ship.

## Field reference

See the schema with all fields and their types in [`src/content/config.ts`](src/content/config.ts).

| Field | Used by | What it does |
| --- | --- | --- |
| `title`, `description`, `heroImage` | both | Required. Card + page header |
| `cardImage`, `cardLabels`, `tags`, `order` | both | Homepage card presentation |
| `subtitle`, `tech`, `data`, `exploration`, `design`, `prototype`, `results`, `conclusions` | case-study | The deep-dive sections |
| `improvement`, `gallery`, `figma` | work | The light-page sections |
| `role`, `team`, `overview` | both | Project meta |

Tip: you can also just ask Claude Code — "add a case study for X with these images" — and it will write the file for you.
