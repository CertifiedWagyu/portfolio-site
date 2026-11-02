import { useEffect, useMemo, useRef } from "react";
import { formatBytes, validateFile } from "../lib/validate";
import { Field } from "./ui";

interface FileInputProps {
  label: string;
  hint?: string;
  accept: string;
  allowedTypes: string[];
  selectedFile: File | null;
  currentUrl?: string | null;
  currentIsPdf?: boolean;
  onSelect: (file: File | null) => void;
  onRemoveExisting: () => void;
  error?: string | null;
  onError: (message: string | null) => void;
}

export function FileInput({
  label,
  hint,
  accept,
  allowedTypes,
  selectedFile,
  currentUrl,
  currentIsPdf,
  onSelect,
  onRemoveExisting,
  error,
  onError,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (file: File | null) => {
    if (!file) {
      onSelect(null);
      onError(null);
      return;
    }
    const problem = validateFile(file, allowedTypes);
    if (problem) {
      onError(problem);
      onSelect(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    onError(null);
    onSelect(file);
  };

  const showExisting = !selectedFile && currentUrl;

  return (
    <Field label={label} hint={hint}>
      <div className="border-2 border-dashed border-border bg-surface/60 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-2 border-border bg-cream">
            {selectedFile && previewUrl && !selectedFile.type.includes("pdf") ? (
              <img src={previewUrl} alt="Selected file preview" className="h-full w-full object-cover" />
            ) : showExisting && !currentIsPdf ? (
              <img src={currentUrl ?? undefined} alt="Current file" className="h-full w-full object-cover" />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={(e) => handleChange(e.target.files?.[0] ?? null)}
              className="block w-full cursor-pointer border-2 border-border bg-surface text-sm text-text-secondary file:mr-3 file:cursor-pointer file:border-0 file:border-r-2 file:border-border file:bg-coal file:px-3 file:py-2 file:font-mono file:text-[10px] file:font-bold file:uppercase file:tracking-[0.12em] file:text-parchment hover:file:bg-ember"
            />
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
              {selectedFile && (
                <span className="text-text-secondary">
                  Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
                </span>
              )}
              {showExisting && !selectedFile && (
                <>
                  <a
                    href={currentUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ember hover:underline"
                  >
                    View current file
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      onRemoveExisting();
                      onError(null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                    className="text-ember hover:underline"
                  >
                    Remove current file
                  </button>
                </>
              )}
            </div>
            {error && <p className="text-xs text-ember">{error}</p>}
          </div>
        </div>
      </div>
    </Field>
  );
}
