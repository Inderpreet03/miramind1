import { Link, useRouterState } from "@tanstack/react-router";
import { Brain, Heart, Home, Activity, LogOut, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { authStore, useAuth } from "@/lib/auth";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/play", label: "Play", icon: Brain },
  { to: "/family", label: "Family", icon: Heart },
  { to: "/staff", label: "Staff", icon: Activity },
] as const;

export function AppHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  return (
    <header className="app-header">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between gap-3">
        <Link to="/" className="brand-link" aria-label="MiraMind home">
          <BrandLogo compact />
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          {links.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={["nav-link", active ? "nav-link-active" : ""].join(
                  " ",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="account-menu">
          <span className="account-avatar" aria-hidden="true">
            <UserRound />
          </span>
          <span className="account-copy">
            <strong>{user?.name}</strong>
            <small>Private profile</small>
          </span>
          <button
            type="button"
            onClick={() => authStore.signOut()}
            className="signout-button"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut />
          </button>
        </div>
      </div>
    </header>
  );
}
