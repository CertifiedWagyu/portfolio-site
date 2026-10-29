export type Visibility = "public" | "private";

export const VISIBILITIES: Visibility[] = ["public", "private"];

export const CERTIFICATE_CATEGORIES = [
  "Academic",
  "Training",
  "Seminar",
  "Award",
  "Achievement",
  "Other",
] as const;

export type CertificateCategory = (typeof CERTIFICATE_CATEGORIES)[number];

export const GAME_PLATFORMS = [
  "Roblox",
  "Steam",
  "itch.io",
  "PC",
  "Browser",
  "Mobile",
  "Console",
  "Other",
] as const;

export type GamePlatform = (typeof GAME_PLATFORMS)[number];

export const GAME_STATUSES = [
  "Published",
  "In Development",
  "Completed",
  "Demo",
  "Prototype",
] as const;

export type GameStatus = (typeof GAME_STATUSES)[number];

export interface Certificate {
  id: string;
  title: string;
  organization: string | null;
  date_received: string | null;
  description: string | null;
  category: string | null;
  file_path: string | null;
  visibility: Visibility;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  title: string;
  description: string | null;
  game_url: string;
  platform: string | null;
  genre: string | null;
  development_status: string | null;
  thumbnail_path: string | null;
  visibility: Visibility;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: number;
  display_name: string;
  tagline: string;
  bio: string;
  avatar_path: string | null;
  updated_at: string;
}

export interface ProfileInput {
  display_name: string;
  tagline: string;
  bio: string;
}

export interface CertificateInput {
  title: string;
  organization: string;
  date_received: string;
  description: string;
  category: string;
  visibility: Visibility;
}

export interface GameInput {
  title: string;
  description: string;
  game_url: string;
  platform: string;
  genre: string;
  development_status: string;
  visibility: Visibility;
}
