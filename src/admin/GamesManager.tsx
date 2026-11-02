import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import { createGame, deleteGame, listAllGames, updateGame } from "../lib/games";
import { GAME_BUCKET } from "../lib/supabase";
import { safeUrl } from "../lib/validate";
import { GAME_PLATFORMS, type Game, type GameInput } from "../lib/types";
import { useSignedUrls } from "../hooks/useSignedUrls";
import { GameForm } from "./GameForm";
import {
  Alert,
  Button,
  ConfirmDialog,
  EmptyState,
  Modal,
  VisibilityBadge,
} from "./ui";

type Toast = { kind: "success" | "error"; message: string };

export function GamesManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("All");
  const [visibility, setVisibility] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAllGames()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const urlMap = useSignedUrls(
    GAME_BUCKET,
    items.map((g) => g.thumbnail_path),
    true
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((g) => {
      const matchesSearch = !q || g.title.toLowerCase().includes(q);
      const matchesPlatform = platform === "All" || g.platform === platform;
      const matchesVisibility = visibility === "All" || g.visibility === visibility;
      return matchesSearch && matchesPlatform && matchesVisibility;
    });
  }, [items, search, platform, visibility]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: Game) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleSubmit = async (
    input: GameInput,
    thumbnail: File | null,
    removeThumbnail: boolean
  ) => {
    if (!user) throw new Error("You must be signed in.");
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateGame(editing, input, thumbnail, removeThumbnail);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        setToast({ kind: "success", message: "Game updated successfully." });
      } else {
        const created = await createGame(user.id, input, thumbnail);
        setItems((prev) => [created, ...prev]);
        setToast({ kind: "success", message: "Game added successfully." });
      }
      setModalOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteGame(deleteTarget);
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setToast({ kind: "success", message: "Game deleted." });
      setDeleteTarget(null);
    } catch (e) {
      setToast({
        kind: "error",
        message: e instanceof Error ? e.message : "Failed to delete.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Alert kind={toast.kind} onClose={() => setToast(null)}>
          {toast.message}
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
          {items.length} game{items.length === 1 ? "" : "s"} total
        </p>
        <Button onClick={openAdd}>+ Add game</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games by name…"
          className="flex-1 border-2 border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
        />
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="border-2 border-border bg-surface px-4 py-2.5 text-sm transition-colors focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
        >
          <option value="All">All platforms</option>
          {GAME_PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="border-2 border-border bg-surface px-4 py-2.5 text-sm transition-colors focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
        >
          <option value="All">All visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <p className="text-sm text-text-muted">Loading games…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No games yet"
          description="Add any game — from Roblox, Steam, itch.io, browser, or anywhere."
          action={<Button onClick={openAdd}>+ Add game</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matching games" description="Adjust your search or filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const thumb = item.thumbnail_path ? urlMap[item.thumbnail_path] : undefined;
            const link = safeUrl(item.game_url);
            return (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden border-2 border-border bg-surface-light"
              >
                <div className="flex aspect-video items-center justify-center overflow-hidden border-b-2 border-border bg-cream">
                  {thumb ? (
                    <img src={thumb} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                      <rect x="2" y="6" width="20" height="12" rx="4" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-[13px] font-extrabold uppercase leading-tight tracking-[-0.01em]">{item.title}</h3>
                    <VisibilityBadge visibility={item.visibility} />
                  </div>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
                    {[item.platform, item.genre, item.development_status]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 truncate text-xs text-accent hover:underline"
                    >
                      {item.game_url}
                    </a>
                  ) : (
                    <span className="mt-2 text-xs text-ember">Invalid URL</span>
                  )}
                  <div className="mt-4 flex gap-2 pt-2">
                    <Button variant="secondary" className="flex-1 px-3 py-2 text-xs" onClick={() => openEdit(item)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="px-3 py-2 text-xs"
                      onClick={() => setDeleteTarget(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        wide
        title={editing ? "Edit game" : "Add game"}
        onClose={() => {
          if (saving) return;
          setModalOpen(false);
          setEditing(null);
        }}
      >
        <GameForm
          initial={editing}
          submitting={saving}
          currentThumbnailUrl={
            editing?.thumbnail_path ? urlMap[editing.thumbnail_path] ?? null : null
          }
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete game?"
        message={`"${deleteTarget?.title ?? ""}" will be permanently deleted, including its thumbnail. This cannot be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
