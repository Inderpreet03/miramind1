# MiraMind

Cognitive training for people living with early dementia, built so family can take part.

Care homes already run daily memory exercises, but they are generic and the family never sees
them. MiraMind pairs five adaptive games with a family hub, so a grandchild can send a photo, a
voice note or a small task and have it show up in that day's session.

## Running it

```
npm install
npm run dev
```

The dev server prints its URL (default `http://localhost:5173`).

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Dev server with hot reload            |
| `npm run build`     | Production build into `dist/client`   |
| `npm run preview`   | Serve the production build locally    |
| `npm run lint`      | ESLint (includes Prettier formatting) |
| `npm run typecheck` | TypeScript, no emit                   |
| `npm run format`    | Rewrite files with Prettier           |

## Layout

```
src/
  routes/          file-based routes; each play.*.tsx is one game
  components/      AppHeader, and GameShell (shared game frame and result panel)
  lib/store.ts     app state: resident, family tasks, session history
  styles.css       Tailwind entry and design tokens
```

State lives in `src/lib/store.ts` and persists to `localStorage`, so a session survives a reload
without a backend. Nothing leaves the browser, which keeps resident data out of scope for this
prototype.

## Games

Each game reads the resident's current difficulty (1 to 5) and sizes itself to match:

- **Memory Match**: find the matching tiles
- **Category Sort**: sort items into groups
- **Sequence**: what number comes next?
- **What's Missing**: spot the missing piece
- **Family Faces**: recognise your loved ones

Accuracy and response time from each round feed the staff dashboard. It suggests raising the
difficulty above 80% accuracy with responses under 5 seconds, and lowering it below 50% accuracy
or past 15 seconds.

## Deploying

Built as a static SPA and hosted on Vercel. `vercel.json` sets the output directory to
`dist/client` and rewrites every unmatched path to the prerendered `_shell.html`, so client-side
routes such as `/play/sequence` resolve on a cold load.
