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
    <div className="flex min-h-screen items-center justify-center bg-grid bg-surface px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-heading text-lg font-bold tracking-tight"
          >
            <span className="text-gradient">{"<Your Name />"}</span>
          </button>
          <h1 className="mt-6 font-heading text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Sign in with your administrator account to manage content.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border-light bg-surface-light/60 p-7 shadow-2xl"
        >
          {error && <Alert kind="error">{error}</Alert>}

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

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mx-auto block text-xs text-text-muted transition-colors hover:text-text-primary"
          >
            ← Back to portfolio
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-text-muted">
          Access is restricted to authorized administrators. There is no public
          sign-up — create your admin account in the Supabase dashboard.
        </p>
      </div>
    </div>
  );
}
