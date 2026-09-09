import { createFileRoute } from "@tanstack/react-router";
import { Activity, Brain, TrendingUp, RefreshCw } from "lucide-react";
import { useStore, useMounted, store } from "@/lib/store";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff Dashboard | MiraMind" },
      {
        name: "description",
        content:
          "Track accuracy, response time and streaks for every resident, and see when to change difficulty.",
      },
    ],
  }),
  component: StaffDashboard,
});

function StaffDashboard() {
  const mounted = useMounted();
  const resident = useStore((s) => s.resident);
  const sessions = useStore((s) => s.sessions);
  const tasks = useStore((s) => s.tasks);

  const recent = mounted ? sessions.slice(0, 8) : [];
  const totalSessions = mounted ? sessions.length : 0;
  const avgAcc =
    mounted && sessions.length
      ? Math.round(
          (sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length) *
            100,
        )
      : 0;
  const completedTasks = mounted
    ? tasks.filter((t) => t.completedAt).length
    : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Staff dashboard
          </p>
          <h1 className="font-display text-4xl sm:text-5xl mt-1">
            Sonnenhof Pflegeheim
          </h1>
          <p className="mt-2 text-muted-foreground">
            A clear view of activity, comfort and recent progress
          </p>
        </div>
        <button
          onClick={() => store.reset()}
          className="btn-large py-2 px-4 text-sm bg-card border border-border text-muted-foreground hover:bg-secondary"
        >
          <RefreshCw className="size-4" /> Reset profile data
        </button>
      </header>

      <section className="mt-8 grid sm:grid-cols-4 gap-4">
        <Kpi icon={<Brain />} label="Avg accuracy" value={`${avgAcc}%`} />
        <Kpi
          icon={<Activity />}
          label="Sessions logged"
          value={`${totalSessions}`}
        />
        <Kpi
          icon={<TrendingUp />}
          label="Difficulty"
          value={`Lvl ${resident.difficulty}`}
        />
        <Kpi
          icon={<Activity />}
          label="Tasks done"
          value={`${completedTasks}`}
        />
      </section>

      <section className="mt-10 grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="card-soft p-6">
          <h2 className="font-display text-2xl">Residents</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Resident</th>
                <th>Difficulty</th>
                <th>Streak</th>
                <th>Sessions</th>
              </tr>
            </thead>
            <tbody>
              <Row
                name={resident.name}
                difficulty={resident.difficulty}
                streak={resident.streakDays}
                sessions={totalSessions}
                accent
              />
              <Row name="Herr Müller" difficulty={3} streak={5} sessions={28} />
              <Row name="Frau Bauer" difficulty={1} streak={1} sessions={6} />
            </tbody>
          </table>
        </div>

        <div className="card-soft p-6">
          <h2 className="font-display text-2xl">Recent activity</h2>
          {recent.length === 0 ? (
            <p className="mt-4 text-muted-foreground">
              No sessions yet. Play a few games and they will show up here.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recent.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2"
                >
                  <div>
                    <div className="font-semibold capitalize">
                      {s.kind.replace("-", " ")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg">
                      {Math.round(s.accuracy * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(s.avgResponseMs / 100) / 10}s avg
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-10 card-soft p-6">
        <h2 className="font-display text-2xl">How difficulty changes</h2>
        <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
          <Rule color="bg-success/20 text-success-foreground" title="Increase">
            accuracy &gt; 80% AND response &lt; 5s
          </Rule>
          <Rule color="bg-warning/30 text-warning-foreground" title="Stay">
            anything in between
          </Rule>
          <Rule color="bg-destructive/15 text-destructive" title="Decrease">
            accuracy &lt; 50% OR response &gt; 15s
          </Rule>
        </div>
      </section>
    </main>
  );
}

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold tracking-wider">
        {icon} {label}
      </div>
      <div className="mt-2 font-display text-3xl">{value}</div>
    </div>
  );
}

function Row({
  name,
  difficulty,
  streak,
  sessions,
  accent,
}: {
  name: string;
  difficulty: number;
  streak: number;
  sessions: number;
  accent?: boolean;
}) {
  return (
    <tr className="border-t border-border">
      <td className="py-3 font-semibold">
        {name}{" "}
        {accent && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
            current
          </span>
        )}
      </td>
      <td>Level {difficulty}</td>
      <td>{streak} d</td>
      <td>{sessions}</td>
    </tr>
  );
}

function Rule({
  color,
  title,
  children,
}: {
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <div className="font-display text-xl">{title}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
