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

Each person creates a local profile with their email address and a four-digit PIN. If Supabase is
configured, profile records, family tasks, media and session histories sync across devices. Without
the cloud settings, the app falls back to separate browser storage so it can still be used locally.

The Family hub accepts loved-one photos and short voice notes. The Staff page keeps a separate
resident summary for each local account and is protected by a staff password set on first visit;
the password hash and the activity data stay on that device.

## Shared cloud mode

1. Create a free Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) once in the Supabase SQL editor. If you already
   ran the earlier version, run [`supabase/shared-family.sql`](supabase/shared-family.sql) instead.
3. Copy `.env.example` to `.env` and fill in the project URL and publishable key.
4. Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values to the hosted site's
   environment variables, then rebuild and deploy.

The `VITE_` values are embedded during the static build, so a new build is required after changing
them. The publishable key is safe for browser use; never add a Supabase service-role key here.

The client only uses Supabase's publishable key. Row-level security policies in the schema protect
write access. The shared care-team policy lets signed-in users read and update the common family
roster, while resident activity and session history remain per account. Keep real clinical records
out of a prototype until privacy, consent, retention and access policies have been reviewed.

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
