import { requireClient, PROFILE_BUCKET } from "./supabase";
import { buildStoragePath, removeFile, uploadFile } from "./storage";
import type { Profile, ProfileInput } from "./types";

const TABLE = "profile";
const SINGLETON_ID = 1;

/** Public: anyone (including guests) can read the single profile row. */
export async function getProfile(): Promise<Profile | null> {
  const client = requireClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("id", SINGLETON_ID)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as Profile | null;
}

/**
 * Admin: create-or-update the single profile row, optionally swapping the
 * profile photo. Guests can never call this — RLS rejects non-admin writes.
 */
export async function saveProfile(
  userId: string,
  input: ProfileInput,
  photo: File | null,
  removeExistingPhoto: boolean
): Promise<Profile> {
  const client = requireClient();

  const current = await getProfile();
  let newPath: string | null | undefined;

  if (photo) {
    newPath = buildStoragePath(userId, photo);
    await uploadFile(PROFILE_BUCKET, newPath, photo);
  } else if (removeExistingPhoto) {
    newPath = null;
  }

  const row = {
    id: SINGLETON_ID,
    display_name: input.display_name.trim() || "Delmart B. Asensi",
    tagline: input.tagline.trim(),
    bio: input.bio.trim(),
    ...(newPath !== undefined ? { avatar_path: newPath } : {}),
  };

  const { data, error } = await client
    .from(TABLE)
    .upsert(row, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    if (newPath) await removeFile(PROFILE_BUCKET, newPath).catch(() => {});
    throw new Error(error.message);
  }

  const oldPath = current?.avatar_path;
  if (oldPath && oldPath !== newPath) {
    await removeFile(PROFILE_BUCKET, oldPath).catch(() => {});
  }

  return data as Profile;
}
