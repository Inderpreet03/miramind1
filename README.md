# MiraMind

MiraMind brings gentle cognitive activities, family connection and progress tracking into one
calm, accessible experience for people living with early dementia and those who support them.

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

Each person creates a local profile with their email address and a four-digit PIN. Profile records
and session histories are stored separately in the browser so people using the same device do not
share progress. This local account system is intended for on-device use; a production deployment
should connect the same interface to a managed authentication and database service.

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
`dist/client` and rewrites every unmatched path to the prerendered `index.html`, so client-side
routes such as `/play/sequence` resolve on a cold load.
