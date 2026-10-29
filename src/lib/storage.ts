import { requireClient } from "./supabase";

function sanitizeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";
  return ext ? `${safeBase}.${ext}` : safeBase;
}

export function buildStoragePath(userId: string, file: File): string {
  const unique = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${userId}/${unique}-${sanitizeFileName(file.name)}`;
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<void> {
  const client = requireClient();
  const { error } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
}

export async function removeFile(bucket: string, path: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}

export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds: number
): Promise<string | null> {
  const client = requireClient();
  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error) return null;
  return data?.signedUrl ?? null;
}
