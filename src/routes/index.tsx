import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Heart, Play, Users } from "lucide-react";
import { useStore, useMounted } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MiraMind | Gentle memory care" },
      {
        name: "description",
        content:
          "Memory activities, family messages and session history for each MiraMind profile.",
      },
      { property: "og:title", content: "MiraMind" },
      {
        property: "og:description",
        content: "Memory activities, family messages and session history.",
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
      <section className="grid items-start gap-8 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:pt-14">
        <div>
          <p className="eyebrow">Today&apos;s session</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight tracking-[-0.025em] sm:text-5xl">
            Ready when you are,
            <br />
            <span className="text-primary">{resident.name}.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Start with a short memory warm-up, then open the messages your
            family has added. Take as much time as you need.
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
              <Heart className="size-5 text-accent" /> View family messages
            </Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
            <div>
              <span className="block text-muted-foreground">Current level</span>
              <strong>Level {resident.difficulty}</strong>
            </div>
            <div>
              <span className="block text-muted-foreground">
                Family messages
              </span>
              <strong>{openTasks} waiting</strong>
            </div>
          </div>
        </div>

        <div className="card-soft p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Session plan</p>
              <h2 className="mt-1 text-3xl">Three things to do</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You can stop or change activities at any time.
              </p>
            </div>
            <div className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
              <Brain />
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <PlanRow
              icon={<Brain />}
              title="Memory warm-up"
              detail={`Level ${resident.difficulty} · about 4 minutes`}
            />
            <PlanRow
              icon={<Heart />}
              title="A moment from family"
              detail={`${openTasks} ${openTasks === 1 ? "message" : "messages"} waiting`}
              accent
            />
            <PlanRow
              icon={<Play />}
              title="Choose another game"
              detail="Pick from five activities"
            />
          </div>

          <Link
            to="/play"
            className="mt-6 flex min-h-14 items-center justify-between rounded-2xl bg-foreground px-5 font-semibold text-white transition hover:bg-primary"
          >
            Open today's plan <ArrowRight className="size-5" />
          </Link>
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

      <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="eyebrow">Signed-in profile</p>
            <h2 className="mt-1 text-2xl">{user?.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {user?.email} · Data for this profile is stored in this browser.
            </p>
          </div>
          <Link
            to="/staff"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 font-semibold hover:bg-secondary"
          >
            View session history <ArrowRight className="size-4" />
          </Link>
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
