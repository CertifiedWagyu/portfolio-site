import { useEffect, useState } from "react";
import { getProfile } from "../lib/profile";
import { createSignedUrl } from "../lib/storage";
import { PROFILE_BUCKET, isSupabaseConfigured } from "../lib/supabase";
import { profile as fallback } from "../data/profile";

export interface SiteProfile {
  displayName: string;
  tagline: string;
  bio: string;
  initials: string;
  avatarUrl: string | null;
}

const FALLBACK_TAGLINE = "BSIT Student · Assumption College of Davao";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Loads the owner's public profile (name, tagline, bio, photo) that only the
 * admin can edit. Falls back to the built-in defaults when the profile table
 * does not exist yet or Supabase is not configured.
 */
export function useSiteProfile(): SiteProfile {
  const [siteProfile, setSiteProfile] = useState<SiteProfile>({
    displayName: fallback.fullName,
    tagline: FALLBACK_TAGLINE,
    bio: fallback.bio,
    initials: fallback.initials,
    avatarUrl: null,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    getProfile()
      .then(async (p) => {
        if (cancelled || !p) return;
        const displayName = p.display_name.trim() || fallback.fullName;
        let avatarUrl: string | null = null;
        if (p.avatar_path) {
          avatarUrl = await createSignedUrl(PROFILE_BUCKET, p.avatar_path, 86400);
        }
        if (!cancelled) {
          setSiteProfile({
            displayName,
            tagline: p.tagline.trim() || FALLBACK_TAGLINE,
            bio: p.bio.trim() || fallback.bio,
            initials: initialsOf(displayName),
            avatarUrl,
          });
        }
      })
      .catch(() => {
        // Table missing (migration not run yet) or offline — keep fallbacks.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return siteProfile;
}
