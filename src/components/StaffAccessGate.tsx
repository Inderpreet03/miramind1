import { LockKeyhole, LogIn, LockOpen, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { staffAuth } from "@/lib/staff-auth";

type AccessMode = "unlock" | "create" | "change";

export function StaffAccessGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [mode, setMode] = useState<AccessMode>("create");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = staffAuth.hasPassword();
    setHasPassword(saved);
    setUnlocked(staffAuth.isUnlocked());
    setMode(saved ? "unlock" : "create");
    setReady(true);
  }, []);

  function beginChange() {
    setMode("change");
    setPassword("");
    setConfirm("");
    setError("");
  }

  function lock() {
    staffAuth.lock();
    setUnlocked(false);
    setMode("unlock");
    setPassword("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "unlock") {
        if (!(await staffAuth.verify(password))) {
          setError("That password does not match.");
          return;
        }
        setUnlocked(true);
      } else {
        if (password !== confirm) {
          setError("The passwords do not match.");
          return;
        }
        await staffAuth.setPassword(password);
        setHasPassword(true);
        setUnlocked(true);
      }
      setPassword("");
      setConfirm("");
      setMode("unlock");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;
  if (unlocked) {
    return (
      <>
        <div className="staff-access-bar">
          <span>
            <ShieldCheck className="size-4" /> Staff access on
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={beginChange} className="text-button">
              Change password
            </button>
            <button type="button" onClick={lock} className="text-button">
              Lock page
            </button>
          </div>
        </div>
        {mode === "change" && (
          <AccessForm
            mode={mode}
            password={password}
            confirm={confirm}
            error={error}
            busy={busy}
            onSubmit={submit}
            onPassword={setPassword}
            onConfirm={setConfirm}
            onCancel={() => setMode("unlock")}
          />
        )}
        {mode !== "change" && children}
      </>
    );
  }

  return (
    <AccessForm
      mode={hasPassword ? "unlock" : "create"}
      password={password}
      confirm={confirm}
      error={error}
      busy={busy}
      onSubmit={submit}
      onPassword={setPassword}
      onConfirm={setConfirm}
    />
  );
}

function AccessForm({
  mode,
  password,
  confirm,
  error,
  busy,
  onSubmit,
  onPassword,
  onConfirm,
  onCancel,
}: {
  mode: AccessMode;
  password: string;
  confirm: string;
  error: string;
  busy: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onPassword: (value: string) => void;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}) {
  const isUnlock = mode === "unlock";
  const isChange = mode === "change";
  return (
    <main className="staff-access-gate">
      <form onSubmit={onSubmit} className="staff-password-card">
        <div className="staff-password-icon">
          {isUnlock ? <LockKeyhole /> : <LockOpen />}
        </div>
        <p className="eyebrow">Staff area</p>
        <h1 className="mt-1 font-display text-4xl">
          {isUnlock
            ? "Staff page locked"
            : isChange
              ? "Change password"
              : "Create staff password"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isUnlock
            ? "Enter the care team password to view resident progress."
            : "Choose a password that only the care team knows."}
        </p>
        <label className="mt-6 block text-sm font-semibold">
          {isUnlock ? "Password" : "New password"}
          <input
            type="password"
            value={password}
            onChange={(event) => onPassword(event.target.value)}
            className="input mt-1"
            minLength={8}
            autoComplete={isUnlock ? "current-password" : "new-password"}
            autoFocus
          />
        </label>
        {!isUnlock && (
          <label className="mt-3 block text-sm font-semibold">
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(event) => onConfirm(event.target.value)}
              className="input mt-1"
              minLength={8}
              autoComplete="new-password"
            />
          </label>
        )}
        {error && <p className="auth-error mt-4">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="btn-large bg-primary text-primary-foreground mt-5 w-full"
        >
          {isUnlock ? (
            <LogIn className="size-4" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
          {busy
            ? "Checking…"
            : isUnlock
              ? "Unlock staff page"
              : isChange
                ? "Save password"
                : "Set password"}
        </button>
        {isChange && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 w-full text-sm font-semibold text-muted-foreground"
          >
            Cancel
          </button>
        )}
        {!isChange && (
          <p className="mt-5 text-xs text-muted-foreground">
            This password is stored only on this device.
          </p>
        )}
      </form>
    </main>
  );
}
