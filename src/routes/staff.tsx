import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Brain,
  RefreshCw,
  Save,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { StaffAccessGate } from "@/components/StaffAccessGate";
import { authStore, useAuth, type PublicUserAccount } from "@/lib/auth";
import {
  store,
  useMounted,
  useStore,
  type UserStateSummary,
} from "@/lib/store";

type ResidentAccountRow = {
  account: PublicUserAccount;
  summary: UserStateSummary;
};

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
  return (
    <StaffAccessGate>
      <StaffDashboardContent />
    </StaffAccessGate>
  );
}

function StaffDashboardContent() {
  const mounted = useMounted();
  const { user } = useAuth();
  const resident = useStore((s) => s.resident);
  const sessions = useStore((s) => s.sessions);
  const tasks = useStore((s) => s.tasks);
  const [residentName, setResidentName] = useState(resident.name);
  const [savedName, setSavedName] = useState(false);
  const [remoteRows, setRemoteRows] = useState<ResidentAccountRow[]>([]);

  useEffect(() => {
    setResidentName(resident.name);
  }, [resident.name]);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    void authStore
      .listAccountsAsync()
      .then(async (accountList) => {
        const nextRows = await Promise.all(
          accountList.map(async (account) => ({
            account,
            summary: await store.summaryForAsync(account.id),
          })),
        );
        if (!cancelled) setRemoteRows(nextRows);
      })
      .catch(() => {
        if (!cancelled) setRemoteRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, resident.name, sessions.length, tasks.length, user?.id]);

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
  const accounts = mounted ? authStore.listAccounts() : [];
  const localRows: ResidentAccountRow[] = accounts.length
    ? accounts.map((account) => ({
        account,
        summary: store.summaryFor(account.id),
      }))
    : user
      ? [
          {
            account: user,
            summary: {
              resident,
              familyCount: 0,
              sessionsCount: totalSessions,
              tasksCompleted: completedTasks,
              lastSessionAt: sessions[0]?.at ?? null,
            },
          },
        ]
      : [];
  const rows = remoteRows.length ? remoteRows : localRows;

  function saveResidentName(event: React.FormEvent) {
    event.preventDefault();
    const nextName = residentName.trim();
    if (!nextName || nextName === resident.name) return;
    store.setResident({ name: nextName });
    setSavedName(true);
    window.setTimeout(() => setSavedName(false), 1800);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Staff dashboard
          </p>
          <h1 className="font-display text-4xl sm:text-5xl mt-1">
            Resident progress
          </h1>
          <p className="mt-2 text-muted-foreground">
            A clear view of activity, comfort and recent progress
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <form onSubmit={saveResidentName} className="resident-name-form">
            <label>
              <span>Resident name</span>
              <input
                value={residentName}
                onChange={(event) => setResidentName(event.target.value)}
                className="input"
                aria-label="Resident name"
              />
            </label>
            <button
              type="submit"
              className="btn-large py-2 px-4 text-sm bg-primary text-primary-foreground"
            >
              <Save className="size-4" /> {savedName ? "Saved" : "Save"}
            </button>
          </form>
          <button
            onClick={() => store.reset()}
            className="btn-large py-2 px-4 text-sm bg-card border border-border text-muted-foreground hover:bg-secondary"
          >
            <RefreshCw className="size-4" /> Reset profile data
          </button>
        </div>
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
        <div className="card-soft p-6 overflow-x-auto">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl">Residents</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Accounts, sessions and activity saved separately for each
                person.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success-foreground">
              <ShieldCheck className="size-3.5" /> {rows.length} account
              {rows.length === 1 ? "" : "s"}
            </span>
          </div>
          {rows.length === 0 ? (
            <p className="mt-5 text-muted-foreground">
              No resident accounts have been created yet.
            </p>
          ) : (
            <table className="mt-4 w-full min-w-[38rem] text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Resident</th>
                  <th>Account</th>
                  <th>Difficulty</th>
                  <th>Streak</th>
                  <th>Sessions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ account, summary }) => (
                  <ResidentRow
                    key={account.id}
                    account={account}
                    summary={summary}
                    accent={account.id === user?.id}
                    mounted={mounted}
                  />
                ))}
              </tbody>
            </table>
          )}
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

function ResidentRow({
  account,
  summary,
  accent,
  mounted,
}: {
  account: PublicUserAccount;
  summary: UserStateSummary;
  accent: boolean;
  mounted: boolean;
}) {
  return (
    <tr className="border-t border-border">
      <td className="py-3 font-semibold">
        {summary.resident.name}
        {accent && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
            current
          </span>
        )}
        <div className="text-xs font-normal text-muted-foreground">
          {account.name}
        </div>
      </td>
      <td>
        <div>{account.email}</div>
        <div className="text-xs text-muted-foreground">
          Created{" "}
          {mounted ? new Date(account.createdAt).toLocaleDateString() : "—"}
        </div>
      </td>
      <td>Level {summary.resident.difficulty}</td>
      <td>{summary.resident.streakDays} d</td>
      <td>{summary.sessionsCount}</td>
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
