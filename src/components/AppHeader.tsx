import { Link, useRouterState } from "@tanstack/react-router";
import { Brain, Heart, Home, Users, Activity } from "lucide-react";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/play", label: "Play", icon: Brain },
  { to: "/family", label: "Family", icon: Heart },
  { to: "/staff", label: "Staff", icon: Activity },
] as const;

export function AppHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/75 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center size-10 rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Users className="size-5" />
          </span>
          <span className="font-display text-xl font-semibold leading-none">
            Mira<span className="text-accent">Mind</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground hover:bg-secondary",
                ].join(" ")}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
