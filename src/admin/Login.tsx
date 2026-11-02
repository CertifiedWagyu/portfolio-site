import { useState, type FormEvent } from "react";
import { useAuth } from "../context/useAuth";
import { navigate } from "../lib/router";
import { Alert, Button, TextInput, Field } from "./ui";

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left transition-opacity hover:opacity-70"
          >
            <span className="flex h-10 w-10 items-center justify-center bg-coal font-mono text-[11px] font-bold text-parchment">
              DA
            </span>
            <span>
              <span className="block font-heading text-sm font-extrabold uppercase tracking-[-0.01em] text-text-primary">
                Delmart / Portfolio
              </span>
              <span className="block font-mono text-[8px] uppercase tracking-[0.28em] text-text-muted">
                Back to site ↗
              </span>
            </span>
          </button>

          <p className="mt-9 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-ember">
            [ Restricted access ]
          </p>
          <h1 className="mt-2 font-heading text-[2.2rem] font-black uppercase leading-[0.9] tracking-[-0.04em] text-text-primary">
            Admin dashboard
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Sign in with your administrator account to manage content.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 border-2 border-border bg-surface-light p-5 shadow-[8px_8px_0_0_var(--color-border)] sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between border-b-2 border-border pb-3 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-text-muted">
              <span>Sign in</span>
              <span className="text-ember">auth / 01</span>
            </div>

            {error && <Alert kind="error">{error}</Alert>}

            <div className="space-y-5">
              <Field label="Email" required>
                <TextInput
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>

              <Field label="Password" required>
                <TextInput
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>

              <Button type="submit" loading={submitting} className="w-full">
                Sign In
              </Button>
            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mx-auto mt-5 block font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-text-primary"
            >
              ← Back to portfolio
            </button>
          </form>

          <p className="mt-6 border-l-2 border-border pl-3 text-xs leading-relaxed text-text-muted">
            Access is restricted to authorized administrators. There is no public
            sign-up — create your admin account in the Supabase dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
