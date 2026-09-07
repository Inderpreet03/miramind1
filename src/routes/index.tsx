import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Heart, Activity, Sparkles, Users, ShieldCheck } from "lucide-react";
import { useStore, useMounted } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Memory Games for Early Dementia | MiraMind" },
      {
        name: "description",
        content:
          "Gentle memory games for early dementia, with daily tasks written by family. Used in care homes across Germany. No timers, no scores to lose.",
      },
      { property: "og:title", content: "Memory games for early dementia" },
      {
        property: "og:description",
        content: "Memory games for early dementia, with daily tasks written by family.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const mounted = useMounted();
  const resident = useStore((s) => s.resident);
  const tasks = useStore((s) => s.tasks);
  const family = useStore((s) => s.family);
  const openTasks = mounted ? tasks.filter((t) => !t.completedAt).length : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      {/* Hero */}
      <section className="pt-10 sm:pt-16 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground px-3 py-1.5 text-sm font-semibold">
            <Sparkles className="size-4 text-accent" /> A warmer kind of brain training
          </span>
          <h1 className="mt-5 font-display text-5xl sm:text-6xl font-semibold leading-[1.05] tracking-tight">
            Memory care that <span className="text-primary">grandchildren</span> can be part of.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl">
            Simple memory games, plus daily tasks written by family: a face to recognise, a voice to
            hear, a small joy to remember. Used in care homes across Germany.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/play"
              className="btn-large bg-primary text-primary-foreground hover:opacity-90 shadow-lift"
            >
              <Brain className="size-5" /> Start today's session
            </Link>
            <Link
              to="/family"
              className="btn-large bg-card text-foreground border border-border hover:bg-secondary"
            >
              <Heart className="size-5 text-accent" /> Family hub
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md text-center">
            <Stat label="Patients in Germany" value="1.8M" />
            <Stat label="Care homes" value="15k+" />
            <Stat label="DGN-aligned" value="✓" />
          </div>
        </div>

        {/* Today card */}
        <div className="card-soft p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 size-40 rounded-full bg-accent/20 blur-2xl" />
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Today for
          </p>
          <h2 className="mt-1 font-display text-3xl">{resident.name}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <MiniStat
              icon={<Brain className="size-4" />}
              label="Difficulty"
              value={`Level ${resident.difficulty}`}
            />
            <MiniStat
              icon={<Activity className="size-4" />}
              label="Streak"
              value={`${resident.streakDays} days`}
            />
            <MiniStat
              icon={<Heart className="size-4 text-accent" />}
              label="Open tasks"
              value={`${openTasks}`}
            />
            <MiniStat
              icon={<Users className="size-4" />}
              label="Family"
              value={`${family.length}`}
            />
          </div>
          <Link
            to="/play"
            className="mt-6 flex items-center justify-between rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors px-4 py-3"
          >
            <span className="font-semibold text-primary">Open today's plan →</span>
            <span className="text-sm text-muted-foreground">{openTasks} from family</span>
          </Link>
        </div>
      </section>

      {/* Three pillars */}
      <section className="mt-20 grid sm:grid-cols-3 gap-5">
        <Pillar
          icon={<Brain />}
          title="Games that adapt"
          body="Memory match, sequences and sorting. The difficulty shifts with how the last session went."
        />
        <Pillar
          icon={<Heart />}
          title="Tasks from family"
          body="Family send photos, voice notes and short prompts, so each session is about people they know."
        />
        <Pillar
          icon={<ShieldCheck />}
          title="Built for care homes"
          body="Staff see accuracy, response time and streaks for every resident. DiGA application in progress."
        />
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft py-3">
      <div className="font-display text-2xl text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 px-3 py-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
        {icon} {label}
      </div>
      <div className="mt-1 font-display text-xl">{value}</div>
    </div>
  );
}

function Pillar({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card-soft p-6">
      <div className="grid place-items-center size-12 rounded-2xl bg-accent/15 text-accent">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-2xl">{title}</h3>
      <p className="mt-2 text-muted-foreground">{body}</p>
    </div>
  );
}
