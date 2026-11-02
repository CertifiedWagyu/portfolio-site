import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import type { Visibility } from "../lib/types";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-3.5 w-3.5 animate-spin border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "border-coal bg-coal text-parchment hover:border-ember hover:bg-ember hover:text-parchment",
  secondary:
    "border-border bg-surface-light text-text-primary hover:bg-cream",
  danger:
    "border-ember bg-ember text-parchment hover:border-ember-deep hover:bg-ember-deep",
  ghost:
    "border-transparent text-text-secondary hover:border-border hover:bg-cream hover:text-text-primary",
};

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 border-2 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${className}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

type AlertKind = "success" | "error" | "info";

const alertStyles: Record<AlertKind, string> = {
  success: "border-forest bg-forest/10 text-forest",
  error: "border-ember bg-ember/10 text-ember",
  info: "border-coal bg-cream text-text-primary",
};

export function Alert({
  kind,
  children,
  onClose,
}: {
  kind: AlertKind;
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-3 border-2 px-4 py-3 text-sm ${alertStyles[kind]}`}
    >
      <span>{children}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-current opacity-70 transition-opacity hover:opacity-100"
          aria-label="Dismiss message"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-text-secondary">
        {label}
        {required && <span className="text-ember"> *</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-xs leading-relaxed text-text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}

const inputClass =
  "w-full border-2 border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={`${inputClass} min-h-24 ${props.className ?? ""}`} />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  const isPublic = visibility === "public";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border-2 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${
        isPublic
          ? "border-forest bg-forest/10 text-forest"
          : "border-border bg-coal/5 text-text-muted"
      }`}
    >
      <span className="h-1.5 w-1.5 bg-current" aria-hidden="true" />
      {isPublic ? "Public" : "Private"}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-border bg-cream text-text-primary">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      </div>
      <p className="font-heading text-base font-extrabold uppercase tracking-[-0.02em]">
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md border-2 border-coal bg-surface-light p-6 shadow-[8px_8px_0_0_var(--color-coal)]">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-ember">
          [ Confirm action ]
        </p>
        <h3 className="mt-2 font-heading text-lg font-extrabold uppercase tracking-[-0.02em]">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:p-8">
      <div
        className={`w-full ${wide ? "max-w-3xl" : "max-w-xl"} border-2 border-coal bg-surface-light shadow-[8px_8px_0_0_var(--color-coal)]`}
      >
        <div className="flex items-center justify-between border-b-2 border-border px-5 py-3.5">
          <h3 className="font-heading text-base font-extrabold uppercase tracking-[-0.02em]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border-2 border-border text-text-muted transition-colors hover:bg-coal hover:text-parchment"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
