import { requireClient, CERTIFICATE_BUCKET } from "./supabase";
import { buildStoragePath, removeFile, uploadFile } from "./storage";
import type { Certificate, CertificateInput } from "./types";

const TABLE = "certificates";

function toRow(input: CertificateInput) {
  return {
    title: input.title.trim(),
    organization: input.organization.trim() || null,
    date_received: input.date_received || null,
    description: input.description.trim() || null,
    category: input.category || null,
    visibility: input.visibility,
  };
}

export async function listPublicCertificates(): Promise<Certificate[]> {
  const client = requireClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("visibility", "public")
    .order("date_received", { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Certificate[];
}

export async function listAllCertificates(): Promise<Certificate[]> {
  const client = requireClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Certificate[];
}

export async function createCertificate(
  userId: string,
  input: CertificateInput,
  file: File | null
): Promise<Certificate> {
  const client = requireClient();
  let filePath: string | null = null;

  if (file) {
    filePath = buildStoragePath(userId, file);
    await uploadFile(CERTIFICATE_BUCKET, filePath, file);
  }

  const { data, error } = await client
    .from(TABLE)
    .insert({ ...toRow(input), file_path: filePath, owner_id: userId })
    .select("*")
    .single();

  if (error) {
    if (filePath) await removeFile(CERTIFICATE_BUCKET, filePath).catch(() => {});
    throw new Error(error.message);
  }
  return data as Certificate;
}

export async function updateCertificate(
  existing: Certificate,
  input: CertificateInput,
  file: File | null,
  removeExistingFile: boolean
): Promise<Certificate> {
  const client = requireClient();
  let newPath: string | null | undefined;

  if (file) {
    newPath = buildStoragePath(existing.owner_id, file);
    await uploadFile(CERTIFICATE_BUCKET, newPath, file);
  } else if (removeExistingFile) {
    newPath = null;
  }

  const patch: Record<string, unknown> = { ...toRow(input) };
  if (newPath !== undefined) patch.file_path = newPath;

  const { data, error } = await client
    .from(TABLE)
    .update(patch)
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) {
    if (newPath) await removeFile(CERTIFICATE_BUCKET, newPath).catch(() => {});
    throw new Error(error.message);
  }

  const oldPath = existing.file_path;
  if (oldPath && oldPath !== newPath) {
    await removeFile(CERTIFICATE_BUCKET, oldPath).catch(() => {});
  }

  return data as Certificate;
}

export async function deleteCertificate(existing: Certificate): Promise<void> {
  const client = requireClient();
  const { error } = await client.from(TABLE).delete().eq("id", existing.id);
  if (error) throw new Error(error.message);
  if (existing.file_path) {
    await removeFile(CERTIFICATE_BUCKET, existing.file_path).catch(() => {});
  }
}
