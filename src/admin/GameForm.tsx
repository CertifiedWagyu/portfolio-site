import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ALLOWED_IMAGE_TYPES, isValidHttpUrl } from "../lib/validate";
import {
  GAME_PLATFORMS,
  GAME_STATUSES,
  VISIBILITIES,
  type Game,
  type GameInput,
  type Visibility,
} from "../lib/types";
import { FileInput } from "./FileInput";
import { Alert, Button, Field, Select, TextArea, TextInput } from "./ui";

interface GameFormProps {
  initial: Game | null;
  submitting: boolean;
  currentThumbnailUrl?: string | null;
  onSubmit: (
    input: GameInput,
    thumbnail: File | null,
    removeThumbnail: boolean
  ) => Promise<void>;
  onCancel: () => void;
}

function toInput(initial: Game | null): GameInput {
  return {
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    game_url: initial?.game_url ?? "",
    platform: initial?.platform ?? "PC",
    genre: initial?.genre ?? "",
    development_status: initial?.development_status ?? "",
    visibility: initial?.visibility ?? "public",
  };
}

export function GameForm({
  initial,
  submitting,
  currentThumbnailUrl,
  onSubmit,
  onCancel,
}: GameFormProps) {
  const [input, setInput] = useState<GameInput>(() => toInput(initial));
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const set = <K extends keyof GameInput>(key: K, value: GameInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const thumbnailPreviewUrl = useMemo(
    () => (thumbnail ? URL.createObjectURL(thumbnail) : null),
    [thumbnail]
  );

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [thumbnailPreviewUrl]);

  const existingThumbnailUrl =
    !removeThumbnail && !thumbnail ? currentThumbnailUrl ?? null : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.title.trim()) {
      setFormError("Game title is required.");
      return;
    }
    if (!isValidHttpUrl(input.game_url)) {
      setFormError("Enter a valid game URL starting with http:// or https://.");
      return;
    }
    if (fileError) {
      setFormError("Please fix the thumbnail error before saving.");
      return;
    }
    setFormError(null);
    try {
      await onSubmit(input, thumbnail, removeThumbnail);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save game.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5">
        {formError && <Alert kind="error">{formError}</Alert>}

        <Field label="Game title" required>
          <TextInput
            value={input.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Hide and Seek"
          />
        </Field>

        <Field label="Game URL or link" required hint="Paste a link from Roblox, Steam, itch.io, or anywhere else.">
          <TextInput
            type="url"
            value={input.game_url}
            onChange={(e) => set("game_url", e.target.value)}
            placeholder="https://…"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Platform">
            <Select
              value={input.platform}
              onChange={(e) => set("platform", e.target.value)}
            >
              {GAME_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Genre" hint="Optional">
            <TextInput
              value={input.genre}
              onChange={(e) => set("genre", e.target.value)}
              placeholder="e.g. Puzzle, Action, RPG"
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Development status" hint="Optional">
            <Select
              value={input.development_status}
              onChange={(e) => set("development_status", e.target.value)}
            >
              <option value="">—</option>
              {GAME_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Visibility">
            <Select
              value={input.visibility}
              onChange={(e) => set("visibility", e.target.value as Visibility)}
            >
              {VISIBILITIES.map((v) => (
                <option key={v} value={v}>
                  {v === "public" ? "Public — visible to everyone" : "Private — only me"}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Description" hint="Optional note about the game, or why you added it.">
          <TextArea
            value={input.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A short description of the game."
          />
        </Field>

        <FileInput
          label="Game thumbnail"
          hint="Allowed: PNG, JPG, WEBP, or GIF up to 10 MB."
          accept=".png,.jpg,.jpeg,.webp,.gif"
          allowedTypes={ALLOWED_IMAGE_TYPES}
          selectedFile={thumbnail}
          currentUrl={existingThumbnailUrl}
          currentIsPdf={false}
          onSelect={setThumbnail}
          onRemoveExisting={() => setRemoveThumbnail(true)}
          error={fileError}
          onError={setFileError}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {initial ? "Save changes" : "Add game"}
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-3 font-mono text-xs uppercase tracking-wide text-text-muted">
          Preview
        </p>
        <div className="overflow-hidden border-2 border-border bg-surface-light">
          <div className="dot-faint aspect-video overflow-hidden border-b-2 border-border bg-cream">
            {thumbnailPreviewUrl ? (
              <img
                src={thumbnailPreviewUrl}
                alt="New thumbnail preview"
                className="h-full w-full object-cover"
              />
            ) : existingThumbnailUrl ? (
              <img
                src={existingThumbnailUrl}
                alt="Current thumbnail"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-xs text-text-muted">
                No thumbnail
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-heading text-base font-extrabold uppercase tracking-[-0.02em]">
                {input.title || "Game title"}
              </h3>
              <span
                className={`shrink-0 border-2 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${
                  input.visibility === "public"
                    ? "border-forest bg-forest/10 text-forest"
                    : "border-border bg-coal/5 text-text-muted"
                }`}
              >
                {input.visibility}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {input.platform && (
                <span className="border-2 border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-text-secondary">
                  {input.platform}
                </span>
              )}
              {input.genre && (
                <span className="border-2 border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-text-secondary">
                  {input.genre}
                </span>
              )}
              {input.development_status && (
                <span className="border-2 border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-text-secondary">
                  {input.development_status}
                </span>
              )}
            </div>
            {input.description && (
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-text-secondary">
                {input.description}
              </p>
            )}
            {isValidHttpUrl(input.game_url) && (
              <p className="mt-3 truncate font-mono text-[10px] text-ember">
                {input.game_url}
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
