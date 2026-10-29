import { useEffect, useMemo, useState } from "react";
import { createSignedUrl } from "../lib/storage";
import { isSupabaseConfigured } from "../lib/supabase";

const PUBLIC_EXPIRY = 60 * 60 * 24; // 1 day for public content
const PRIVATE_EXPIRY = 60 * 60; // 1 hour for private content

/**
 * Turns a list of storage paths into short-lived signed URLs. Private files
 * only resolve for the authenticated admin because the storage RLS policies
 * reject anonymous signing requests; public files resolve for everyone.
 */
export function useSignedUrls(
  bucket: string,
  paths: (string | null | undefined)[],
  isPrivate = false
): Record<string, string> {
  const key = useMemo(
    () => paths.filter(Boolean).join("|"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paths.join("|")]
  );
  const [urlMap, setUrlMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const list = key ? key.split("|") : [];
    if (list.length === 0) {
      setUrlMap({});
      return;
    }

    let cancelled = false;
    const expires = isPrivate ? PRIVATE_EXPIRY : PUBLIC_EXPIRY;

    Promise.all(
      list.map(async (path) => {
        const url = await createSignedUrl(bucket, path, expires);
        return [path, url] as const;
      })
    ).then((entries) => {
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const [path, url] of entries) {
        if (url) next[path] = url;
      }
      setUrlMap(next);
    });

    return () => {
      cancelled = true;
    };
  }, [key, bucket, isPrivate]);

  return urlMap;
}
