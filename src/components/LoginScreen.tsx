import { useState } from "react";
import {
  ArrowRight,
  Check,
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
            <p className="eyebrow text-white/70">MiraMind memory care</p>
            <h1>
              Practice with people
              <br />
              and memories you know.
            </h1>
            <p>
              Short memory activities, family messages and a clear record of
              each session, all in one place.
            </p>
          </div>
          <div className="auth-points">
            <div>
              <Check /> Five short memory activities
            </div>
            <div>
              <Check /> Family messages in today&apos;s session
            </div>
            <div>
              <Check /> Separate progress for each profile
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
            <LockKeyhole />
          </div>
          <p className="eyebrow">Your MiraMind profile</p>
          <h2>{mode === "signin" ? "Sign in" : "Create your profile"}</h2>
          <p className="auth-intro">
            {mode === "signin"
              ? "Use the email address and PIN for this profile."
              : "This keeps your session history separate from other people using this device."}
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
            <ShieldCheck /> Account details and progress stay in this browser.
          </p>
        </div>
      </section>
    </main>
  );
}
