import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { getProfile, saveProfile } from "../lib/profile";
import { PROFILE_BUCKET, isSupabaseConfigured } from "../lib/supabase";
import { ALLOWED_IMAGE_TYPES } from "../lib/validate";
import { useSignedUrls } from "../hooks/useSignedUrls";
import { FileInput } from "./FileInput";
import { Alert, Button, Field, TextArea, TextInput } from "./ui";

export function ProfileManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    getProfile()
      .then((p) => {
        if (cancelled) return;
        if (p) {
          setDisplayName(p.display_name);
          setTagline(p.tagline);
          setBio(p.bio);
          setAvatarPath(p.avatar_path);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLoadError(
            e instanceof Error
              ? e.message
              : "Could not load your profile. Did you run supabase/profile.sql yet?"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const urlMap = useSignedUrls(PROFILE_BUCKET, [avatarPath]);
  const currentUrl = avatarPath ? (urlMap[avatarPath] ?? null) : null;

  const handleSave = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      setNotice({ kind: "error", text: "Display name cannot be empty." });
      return;
    }
    if (fileError) {
      setNotice({ kind: "error", text: "Fix the photo problem first." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const saved = await saveProfile(
        user.id,
        { display_name: displayName, tagline, bio },
        photo,
        removePhoto
      );
      setAvatarPath(saved.avatar_path);
      setPhoto(null);
      setRemovePhoto(false);
      setNotice({ kind: "success", text: "Your public profile was updated." });
    } catch (e: unknown) {
      setNotice({
        kind: "error",
        text: e instanceof Error ? e.message : "Could not save your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-text-muted">Loading your profile…</p>;
  }

  if (loadError) {
    return (
      <Alert kind="error">
        {loadError} Run <span className="font-mono">supabase/profile.sql</span> in
        the Supabase SQL Editor, then reload this page.
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      {notice && (
        <Alert kind={notice.kind} onClose={() => setNotice(null)}>
          {notice.text}
        </Alert>
      )}

      <div className="border-2 border-border bg-surface-light">
        <div className="flex items-center justify-between border-b-2 border-border px-5 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">
          <span>Public profile</span>
          <span className="text-ember">02 / 01</span>
        </div>
        <div className="p-5 sm:p-6">
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-[-0.02em]">
            Public profile
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            This is what guests see at the top of your website — your photo, name,
            and short intro.
          </p>

          <div className="mt-5 space-y-4">
          <FileInput
            label="Profile photo"
            hint="Square photos look best. Max 5 MB — PNG, JPG, WEBP, or GIF."
            accept="image/png,image/jpeg,image/webp,image/gif"
            allowedTypes={ALLOWED_IMAGE_TYPES}
            selectedFile={photo}
            currentUrl={removePhoto ? null : currentUrl}
            currentIsPdf={false}
            onSelect={(f) => {
              setPhoto(f);
              if (f) setRemovePhoto(false);
            }}
            onRemoveExisting={() => {
              setRemovePhoto(true);
              setPhoto(null);
            }}
            error={fileError}
            onError={setFileError}
          />

          <Field label="Display name" required>
            <TextInput
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Delmart B. Asensi"
              maxLength={80}
            />
          </Field>

          <Field label="Tagline" hint="One short line under your name.">
            <TextInput
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="BSIT Student · Web Developer · Gamer"
              maxLength={120}
            />
          </Field>

          <Field label="Bio" hint="A few sentences about you.">
            <TextArea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell guests who you are…"
              rows={5}
              maxLength={1000}
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end border-t-2 border-border pt-5">
          <Button onClick={handleSave} loading={saving}>
            Save profile
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
