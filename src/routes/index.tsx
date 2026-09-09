import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Heart,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { useStore, useMounted } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MiraMind | Gentle memory care" },
      {
        name: "description",
        content:
          "Gentle memory activities, family connection and personal progress in one place.",
      },
      { property: "og:title", content: "MiraMind" },
      {
        property: "og:description",
        content: "Gentle memory activities and meaningful family connection.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const mounted = useMounted();
  const { user } = useAuth();
  const resident = useStore((state) => state.resident);
  const tasks = useStore((state) => state.tasks);
  const family = useStore((state) => state.family);
  const sessions = useStore((state) => state.sessions);
  const openTasks = mounted
    ? tasks.filter((task) => !task.completedAt).length
    : 0;
  const completedThisWeek = mounted
    ? sessions.filter((session) => Date.now() - session.at < 7 * 86400000)
        .length
    : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28">
      <section className="grid items-center gap-10 pt-10 lg:grid-cols-[1.03fr_0.97fr] lg:pt-16">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <Sparkles className="size-4" /> Your calm daily routine
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
            Every memory holds
            <br />a little <span className="text-primary">connection.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Gentle activities that meet {resident.name} where they are, with
            familiar faces and messages from the people who matter most.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/play"
              className="btn-large bg-primary text-primary-foreground shadow-lift hover:-translate-y-0.5 hover:opacity-95"
            >
              <Play className="size-5 fill-current" /> Begin today's session
            </Link>
            <Link
              to="/family"
              className="btn-large border border-border bg-card text-foreground hover:bg-secondary"
            >
              <Heart className="size-5 text-accent" /> Open family space
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" /> No pressure or
              countdowns
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" /> Adapts gently
              over time
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 top-14 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-8 bottom-8 h-44 w-44 rounded-full bg-success/15 blur-3xl" />
          <div className="card-soft relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-success to-[#9f8be8]" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Today for</p>
                <h2 className="mt-1 text-3xl">{resident.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  A gentle plan, ready when you are.
                </p>
              </div>
              <div className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
                <Brain />
              </div>
            </div>

            <div className="mt-7 space-y-3">
              <PlanRow
                icon={<Brain />}
                title="A short memory warm-up"
                detail={`Level ${resident.difficulty} · about 4 minutes`}
              />
              <PlanRow
                icon={<Heart />}
                title="A moment from family"
                detail={`${openTasks} ${openTasks === 1 ? "message" : "messages"} waiting`}
                accent
              />
              <PlanRow
                icon={<Sparkles />}
                title="Finish with a favourite game"
                detail="Choose anything that feels good"
              />
            </div>

            <Link
              to="/play"
              className="mt-6 flex min-h-14 items-center justify-between rounded-2xl bg-foreground px-5 font-semibold text-white transition hover:bg-primary"
            >
              Open today's plan <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        <Metric
          icon={<Brain />}
          value={`${completedThisWeek}`}
          label="sessions this week"
        />
        <Metric
          icon={<Heart />}
          value={`${openTasks}`}
          label="family moments waiting"
        />
        <Metric
          icon={<Users />}
          value={`${family.length}`}
          label="loved ones connected"
        />
      </section>

      <section className="mt-16 rounded-3xl border border-border bg-card/70 p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div>
            <p className="eyebrow">Your private space</p>
            <h2 className="mt-2 text-3xl">Welcome back, {user?.name}.</h2>
            <p className="mt-3 text-muted-foreground">
              Your activities, family updates and progress are kept in this
              profile.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Pillar
              title="Play"
              body="Five focused activities with clear, reassuring guidance."
            />
            <Pillar
              title="Connect"
              body="Keep familiar people and personal messages close."
            />
            <Pillar
              title="Notice"
              body="See patterns without turning care into a scorecard."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function PlanRow({
  icon,
  title,
  detail,
  accent = false,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/65 p-4">
      <div
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${accent ? "bg-accent/12 text-accent" : "bg-primary/10 text-primary"}`}
      >
        {icon}
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="card-soft flex items-center gap-4 p-5">
      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
        {icon}
      </div>
      <div>
        <div className="font-display text-3xl font-bold leading-none">
          {value}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-secondary/55 p-4">
      <h3 className="text-xl">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
