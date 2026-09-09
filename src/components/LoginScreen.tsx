import { useState } from "react";
import {
  ArrowRight,
  Check,
  Heart,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { authStore } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";

type Mode = "signin" | "signup";

export function LoginScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (mode === "signup" && name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setError("Your PIN must contain 4 numbers.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") await authStore.signUp(name, email, pin);
      else await authStore.signIn(email, pin);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="auth-story-inner">
          <BrandLogo className="auth-brand" />
          <div className="auth-copy">
            <p className="eyebrow text-white/70">
              A familiar place for every day
            </p>
            <h1>
              Small moments.
              <br />
              Meaningful progress.
            </h1>
            <p>
              Gentle memory activities, family connections and progress that
              stays private to each profile.
            </p>
          </div>
          <div className="auth-points">
            <div>
              <Check /> Personal session history
            </div>
            <div>
              <Check /> A separate space for every user
            </div>
            <div>
              <Check /> Calm, easy-to-read activities
            </div>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <BrandLogo />
          </div>
          <div className="auth-icon">
            <Heart />
          </div>
          <p className="eyebrow">Welcome to MiraMind</p>
          <h2>
            {mode === "signin"
              ? "Sign in to your space"
              : "Create your profile"}
          </h2>
          <p className="auth-intro">
            {mode === "signin"
              ? "Continue where you left off."
              : "Your progress will be kept separate on this device."}
          </p>

          <div
            className="auth-tabs"
            role="tablist"
            aria-label="Account options"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              onClick={() => switchMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              onClick={() => switchMode("signup")}
            >
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="auth-form">
            {mode === "signup" && (
              <label>
                <span>Your name</span>
                <span className="field-control">
                  <UserRound />
                  <input
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Anna"
                  />
                </span>
              </label>
            )}
            <label>
              <span>Email address</span>
              <span className="field-control">
                <UserRound />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </span>
            </label>
            <label>
              <span>4-digit PIN</span>
              <span className="field-control">
                <LockKeyhole />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  value={pin}
                  onChange={(event) =>
                    setPin(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="••••"
                />
              </span>
            </label>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="auth-submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create my profile"}
              {!busy && <ArrowRight />}
            </button>
          </form>

          <p className="auth-note">
            <ShieldCheck /> Profiles and progress are stored on this device.
          </p>
        </div>
      </section>
    </main>
  );
}
