export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB, matches the storage bucket limit

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

export const ALLOWED_CERTIFICATE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFile(
  file: File,
  allowedTypes: string[],
  maxBytes = MAX_FILE_BYTES
): string | null {
  if (!allowedTypes.includes(file.type)) {
    const names = allowedTypes
      .map((t) => t.split("/")[1].toUpperCase())
      .join(", ");
    return `Unsupported file type. Allowed: ${names}.`;
  }
  if (file.size > maxBytes) {
    return `File is too large (${formatBytes(file.size)}). Maximum is ${formatBytes(maxBytes)}.`;
  }
  return null;
}

/**
 * Only allows absolute http(s) links. Prevents "javascript:" and other
 * unsafe protocols from ever being rendered into an href.
 */
export function safeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function isValidHttpUrl(raw: string): boolean {
  return safeUrl(raw) !== null;
}

export function isPdfPath(path: string | null | undefined): boolean {
  return Boolean(path && path.toLowerCase().endsWith(".pdf"));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
