import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
  createCertificate,
  deleteCertificate,
  listAllCertificates,
  updateCertificate,
} from "../lib/certificates";
import { CERTIFICATE_BUCKET } from "../lib/supabase";
import { formatDate, isPdfPath } from "../lib/validate";
import {
  CERTIFICATE_CATEGORIES,
  type Certificate,
  type CertificateInput,
} from "../lib/types";
import { useSignedUrls } from "../hooks/useSignedUrls";
import { CertificateForm } from "./CertificateForm";
import {
  Alert,
  Button,
  ConfirmDialog,
  EmptyState,
  Modal,
  VisibilityBadge,
} from "./ui";

type Toast = { kind: "success" | "error"; message: string };

export function CertificatesManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [visibility, setVisibility] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAllCertificates()
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
    CERTIFICATE_BUCKET,
    items.map((c) => c.file_path),
    true
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.organization ?? "").toLowerCase().includes(q);
      const matchesCategory = category === "All" || c.category === category;
      const matchesVisibility = visibility === "All" || c.visibility === visibility;
      return matchesSearch && matchesCategory && matchesVisibility;
    });
  }, [items, search, category, visibility]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: Certificate) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleSubmit = async (
    input: CertificateInput,
    file: File | null,
    removeFile: boolean
  ) => {
    if (!user) throw new Error("You must be signed in.");
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateCertificate(editing, input, file, removeFile);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        setToast({ kind: "success", message: "Certificate updated successfully." });
      } else {
        const created = await createCertificate(user.id, input, file);
        setItems((prev) => [created, ...prev]);
        setToast({ kind: "success", message: "Certificate added successfully." });
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
      await deleteCertificate(deleteTarget);
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setToast({ kind: "success", message: "Certificate deleted." });
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
          {items.length} certificate{items.length === 1 ? "" : "s"} total
        </p>
        <Button onClick={openAdd}>+ Add certificate</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or organization…"
          className="flex-1 border-2 border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border-2 border-border bg-surface px-4 py-2.5 text-sm transition-colors focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
        >
          <option value="All">All categories</option>
          {CERTIFICATE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
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
        <p className="text-sm text-text-muted">Loading certificates…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Add your first certificate to start building your gallery."
          action={<Button onClick={openAdd}>+ Add certificate</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matching certificates" description="Adjust your search or filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const url = item.file_path ? urlMap[item.file_path] : undefined;
            return (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden border-2 border-border bg-surface-light"
              >
                <div className="flex aspect-[16/10] items-center justify-center overflow-hidden border-b-2 border-border bg-cream">
                  {url && !isPdfPath(item.file_path) ? (
                    <img src={url} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-[13px] font-extrabold uppercase leading-tight tracking-[-0.01em]">{item.title}</h3>
                    <VisibilityBadge visibility={item.visibility} />
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">{item.organization}</p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
                    {[item.category, formatDate(item.date_received)].filter(Boolean).join(" · ")}
                  </p>
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
        title={editing ? "Edit certificate" : "Add certificate"}
        onClose={() => {
          if (saving) return;
          setModalOpen(false);
          setEditing(null);
        }}
      >
        <CertificateForm
          initial={editing}
          submitting={saving}
          currentFileUrl={editing?.file_path ? urlMap[editing.file_path] ?? null : null}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete certificate?"
        message={`"${deleteTarget?.title ?? ""}" will be permanently deleted, including its uploaded file. This cannot be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
