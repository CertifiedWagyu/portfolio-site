import { requireClient, GAME_BUCKET } from "./supabase";
import { buildStoragePath, removeFile, uploadFile } from "./storage";
import type { Game, GameInput } from "./types";

const TABLE = "games";

function toRow(input: GameInput) {
  return {
    title: input.title.trim(),
    description: input.description.trim() || null,
    game_url: input.game_url.trim(),
    platform: input.platform || null,
    genre: input.genre.trim() || null,
    development_status: input.development_status || null,
    visibility: input.visibility,
  };
}

export async function listPublicGames(): Promise<Game[]> {
  const client = requireClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Game[];
}

export async function listAllGames(): Promise<Game[]> {
  const client = requireClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Game[];
}

export async function createGame(
  userId: string,
  input: GameInput,
  thumbnail: File | null
): Promise<Game> {
  const client = requireClient();
  let thumbnailPath: string | null = null;

  if (thumbnail) {
    thumbnailPath = buildStoragePath(userId, thumbnail);
    await uploadFile(GAME_BUCKET, thumbnailPath, thumbnail);
  }

  const { data, error } = await client
    .from(TABLE)
    .insert({ ...toRow(input), thumbnail_path: thumbnailPath, owner_id: userId })
    .select("*")
    .single();

  if (error) {
    if (thumbnailPath)
      await removeFile(GAME_BUCKET, thumbnailPath).catch(() => {});
    throw new Error(error.message);
  }
  return data as Game;
}

export async function updateGame(
  existing: Game,
  input: GameInput,
  thumbnail: File | null,
  removeExistingThumbnail: boolean
): Promise<Game> {
  const client = requireClient();
  let newPath: string | null | undefined;

  if (thumbnail) {
    newPath = buildStoragePath(existing.owner_id, thumbnail);
    await uploadFile(GAME_BUCKET, newPath, thumbnail);
  } else if (removeExistingThumbnail) {
    newPath = null;
  }

  const patch: Record<string, unknown> = { ...toRow(input) };
  if (newPath !== undefined) patch.thumbnail_path = newPath;

  const { data, error } = await client
    .from(TABLE)
    .update(patch)
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) {
    if (newPath) await removeFile(GAME_BUCKET, newPath).catch(() => {});
    throw new Error(error.message);
  }

  const oldPath = existing.thumbnail_path;
  if (oldPath && oldPath !== newPath) {
    await removeFile(GAME_BUCKET, oldPath).catch(() => {});
  }

  return data as Game;
}

export async function deleteGame(existing: Game): Promise<void> {
  const client = requireClient();
  const { error } = await client.from(TABLE).delete().eq("id", existing.id);
  if (error) throw new Error(error.message);
  if (existing.thumbnail_path) {
    await removeFile(GAME_BUCKET, existing.thumbnail_path).catch(() => {});
  }
}
