import { useState } from "react";
import { socials } from "../data/profile";
import { Reveal, Tilt } from "./Decor";
import { Section } from "./Section";

const ICONS: Record<string, React.ReactNode> = {
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Zm2.2.5 7.8 5.6L19.8 6H4.2ZM20 7.9l-7.5 5.4a1 1 0 0 1-1 0L4 7.9V18h16V7.9Z" />
    </svg>
  ),
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  ),
  twitter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.11l11.97 15.64Z" />
    </svg>
  ),
  roblox: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5.7 2 2 5.7l3.7 3.7L2 13.1l3.7 3.7-3.7 3.7 3.7 3.7 3.7-3.7 3.7 3.7 3.7-3.7-3.7-3.7 3.7-3.7-3.7-3.7 3.7-3.7L18.3 2l-3.7 3.7L10.9 2 7.2 5.7 3.5 2h2.2Zm5.2 7.4 3.7 3.7-3.7 3.7-3.7-3.7 3.7-3.7Z" />
    </svg>
  ),
  discord: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.32 4.57A19.79 19.79 0 0 0 15.43 3c-.24.42-.5.99-.69 1.44a18.3 18.3 0 0 0-5.48 0C9.07 3.99 8.8 3.42 8.56 3a19.74 19.74 0 0 0-4.89 1.57C.56 9.2-.27 13.7.15 18.14a19.9 19.9 0 0 0 6.04 3.06c.49-.66.92-1.37 1.29-2.11-.71-.27-1.39-.6-2.03-1a12.9 12.9 0 0 0 .56-.32 14.2 14.2 0 0 0 12.17 0c.18.11.37.22.56.32-.64.4-1.32.73-2.03 1 .37.74.8 1.45 1.29 2.11a19.86 19.86 0 0 0 6.04-3.06c.5-5.15-.84-9.6-3.67-13.57ZM8.02 15.44c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4c1.21 0 2.18 1.08 2.16 2.4 0 1.32-.95 2.4-2.16 2.4Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4c1.21 0 2.18 1.08 2.16 2.4 0 1.32-.95 2.4-2.16 2.4Z" />
    </svg>
  ),
};

const inputClasses =
  "w-full border-2 border-coal bg-card px-4 py-3 font-mono text-xs text-coal placeholder:text-latte transition-colors focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";

export function Contact({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [copiedSocial, setCopiedSocial] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const copySocialHandle = async (key: string, handle: string) => {
    const value = handle.replace(/^@/, "");
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiedSocial(key);
    window.setTimeout(() => setCopiedSocial(null), 2000);
  };

  return (
    <Section
      id="contact"
      index="07"
      eyebrow="Contact"
      title="Let's make something real"
      description="Want to talk, play a game together, or ask me something? These are the best ways to reach me."
    >
      <Reveal>
        <a
          href={`mailto:${email}`}
          className="group relative mb-4 flex flex-col gap-2 overflow-hidden border-2 border-coal bg-ink p-6 transition-colors hover:bg-[#121214] sm:p-10"
        >
          <span
            aria-hidden="true"
            className="grid-ink pointer-events-none absolute inset-0 opacity-50"
          />
          <span className="relative flex flex-wrap items-center justify-between gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.28em]">
            <span className="text-ember">Fastest reply — usually within a day</span>
            <span className="text-mist/30">/ 07.01</span>
          </span>
          <span className="relative mt-2 break-all font-heading text-[clamp(1.35rem,4.2vw,3rem)] font-black uppercase leading-none tracking-[-0.04em] text-mist">
            {email}
          </span>
          <span className="relative mt-5 flex flex-wrap items-center gap-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist/40">
              Click to open your mail app →
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                copyEmail();
              }}
              className="border-2 border-mist/25 px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-mist transition-colors hover:border-ember hover:bg-ember hover:text-parchment"
            >
              {copied ? "✓ Copied" : "Copy email"}
            </button>
          </span>
        </a>
      </Reveal>

      <Reveal delay={100}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const subject = encodeURIComponent(
              `Website message from ${formName.trim() || "a visitor"}`
            );
            const body = encodeURIComponent(
              `${formMessage.trim()}\n\n— ${formName.trim()} (${formEmail.trim()})`
            );
            window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
          }}
          className="mb-4 border-2 border-coal bg-card p-5 sm:p-8"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-coal pb-4">
            <h3 className="font-heading text-lg font-extrabold uppercase tracking-[-0.02em] text-coal">
              Send a message
            </h3>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-latte">
              / no data stored
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-fawn">
            This opens your mail app with everything filled in — nothing is stored anywhere.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-fawn">
                Your name
              </span>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Jane Doe"
                maxLength={80}
                className={inputClasses}
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-fawn">
                Your email
              </span>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="jane@example.com"
                maxLength={120}
                className={inputClasses}
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-fawn">
              Message
            </span>
            <textarea
              required
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              placeholder="Hi Delmart! …"
              rows={4}
              maxLength={2000}
              className={`${inputClasses} resize-y`}
            />
          </label>
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="hover-brutal border-2 border-coal bg-coal px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-parchment"
            >
              Send via email →
            </button>
          </div>
        </form>
      </Reveal>

      <div className="grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
        {socials
          .filter((s) => s.key !== "email")
          .map((s, i) => {
            const cardClass = `group flex h-full w-full items-center gap-4 border-2 border-coal bg-card p-4 text-left transition-colors hover:bg-cream ${
              i > 0 ? "sm:-ml-0.5" : ""
            }`;
            const body = (
              <>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-coal bg-coal text-parchment transition-colors group-hover:bg-ember group-hover:text-parchment">
                  {ICONS[s.key]}
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-latte">
                    {s.label}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-semibold text-coal">
                    {!s.href && copiedSocial === s.key ? "Copied!" : s.handle}
                  </span>
                </span>
              </>
            );
            return (
              <Reveal key={s.key} delay={i * 70} className="h-full">
                <Tilt className="h-full" max={4}>
                  {s.href ? (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClass}
                    >
                      {body}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void copySocialHandle(s.key, s.handle)}
                      title={`Copy ${s.handle}`}
                      aria-label={`Copy ${s.label} username ${s.handle}`}
                      className={`${cardClass} cursor-pointer`}
                    >
                      {body}
                    </button>
                  )}
                </Tilt>
              </Reveal>
            );
          })}
      </div>
    </Section>
  );
}
