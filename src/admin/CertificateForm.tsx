import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ALLOWED_CERTIFICATE_TYPES,
  formatDate,
} from "../lib/validate";
import {
  CERTIFICATE_CATEGORIES,
  VISIBILITIES,
  type Certificate,
  type CertificateInput,
  type Visibility,
} from "../lib/types";
import { FileInput } from "./FileInput";
import { Alert, Button, Field, Select, TextArea, TextInput } from "./ui";

interface CertificateFormProps {
  initial: Certificate | null;
  submitting: boolean;
  currentFileUrl?: string | null;
  onSubmit: (
    input: CertificateInput,
    file: File | null,
    removeFile: boolean
  ) => Promise<void>;
  onCancel: () => void;
}

function toInput(initial: Certificate | null): CertificateInput {
  return {
    title: initial?.title ?? "",
    organization: initial?.organization ?? "",
    date_received: initial?.date_received ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "Academic",
    visibility: initial?.visibility ?? "public",
  };
}

export function CertificateForm({
  initial,
  submitting,
  currentFileUrl,
  onSubmit,
  onCancel,
}: CertificateFormProps) {
  const [input, setInput] = useState<CertificateInput>(() => toInput(initial));
  const [file, setFile] = useState<File | null>(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const set = <K extends keyof CertificateInput>(key: K, value: CertificateInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const filePreviewUrl = useMemo(
    () => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file]
  );

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const existingFileUrl = !removeFile && !file ? currentFileUrl ?? null : null;
  const showNewPreview = Boolean(file);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.title.trim()) {
      setFormError("Certificate title is required.");
      return;
    }
    if (fileError) {
      setFormError("Please fix the file error before saving.");
      return;
    }
    setFormError(null);
    try {
      await onSubmit(input, file, removeFile);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save certificate.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5">
        {formError && <Alert kind="error">{formError}</Alert>}

        <Field label="Certificate title" required>
          <TextInput
            value={input.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Dean's Lister Award"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Issuing school or organization">
            <TextInput
              value={input.organization}
              onChange={(e) => set("organization", e.target.value)}
              placeholder="e.g. Assumption College of Davao"
            />
          </Field>
          <Field label="Date received">
            <TextInput
              type="date"
              value={input.date_received ?? ""}
              onChange={(e) => set("date_received", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <Select
              value={input.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CERTIFICATE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Visibility">
            <Select
              value={input.visibility}
              onChange={(e) => set("visibility", e.target.value as Visibility)}
            >
              {VISIBILITIES.map((v) => (
                <option key={v} value={v}>
                  {v === "public" ? "Public — visible to everyone" : "Private — only me"}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Description or achievement details">
          <TextArea
            value={input.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe what this certificate is for."
          />
        </Field>

        <FileInput
          label="Certificate image or PDF"
          hint="Allowed: PNG, JPG, WEBP, GIF, or PDF up to 10 MB."
          accept=".png,.jpg,.jpeg,.webp,.gif,.pdf"
          allowedTypes={ALLOWED_CERTIFICATE_TYPES}
          selectedFile={file}
          currentUrl={existingFileUrl}
          currentIsPdf={Boolean(initial?.file_path?.toLowerCase().endsWith(".pdf"))}
          onSelect={setFile}
          onRemoveExisting={() => setRemoveFile(true)}
          error={fileError}
          onError={setFileError}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {initial ? "Save changes" : "Add certificate"}
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-3 font-mono text-xs uppercase tracking-wide text-text-muted">
          Preview
        </p>
        <div className="rounded-2xl border border-border-light bg-surface-light/40 p-5">
          <div className="mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-border-light bg-gradient-to-br from-primary/15 via-surface-lighter to-accent/15">
            {showNewPreview && filePreviewUrl ? (
              <img
                src={filePreviewUrl}
                alt="New certificate preview"
                className="h-full w-full object-cover"
              />
            ) : existingFileUrl && !initial?.file_path?.toLowerCase().endsWith(".pdf") ? (
              <img
                src={existingFileUrl}
                alt="Current certificate"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-text-muted">
                <span className="font-mono text-xs">
                  {showNewPreview && file
                    ? file.type.includes("pdf")
                      ? "PDF selected"
                      : "File selected"
                    : "No preview"}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading text-base font-semibold">
              {input.title || "Certificate title"}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] ${
                input.visibility === "public"
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-amber-500/10 text-amber-300"
              }`}
            >
              {input.visibility}
            </span>
          </div>
          <p className="mt-1 text-sm text-accent">
            {input.organization || "Issuing organization"}
          </p>
          <p className="mt-0.5 font-mono text-xs text-text-muted">
            {formatDate(input.date_received) || "Date received"}
          </p>
          {input.description && (
            <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-text-secondary">
              {input.description}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
