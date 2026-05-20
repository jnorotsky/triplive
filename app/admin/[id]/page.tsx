"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Trip, ItineraryItem, Update, TripDocument, TripWithDetails } from "@/lib/types";

const ITEM_TYPES = [
  { value: "hotel", label: "🏨 Hotel" },
  { value: "flight", label: "✈️ Flight" },
  { value: "activity", label: "🎭 Activity" },
  { value: "restaurant", label: "🍽️ Restaurant" },
  { value: "transfer", label: "🚗 Transfer" },
  { value: "note", label: "📝 Note" },
];

const TYPE_ICONS: Record<string, string> = {
  hotel: "🏨",
  flight: "✈️",
  activity: "🎭",
  restaurant: "🍽️",
  transfer: "🚗",
  note: "📝",
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function groupItemsByDay(items: ItineraryItem[]): Map<string, ItineraryItem[]> {
  const map = new Map<string, ItineraryItem[]>();
  for (const item of items) {
    const key = item.day_date || "no-date";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return map;
}

// ─── Input component ─────────────────────────────────────────────────────────
function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  fullWidth = true,
}: {
  label?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14, width: fullWidth ? "100%" : undefined }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 500,
            color: "#57534e",
            marginBottom: 5,
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          border: "1px solid #e7e5e4",
          borderRadius: 10,
          padding: "9px 12px",
          fontSize: 14,
          outline: "none",
          background: "#fafaf9",
          color: "#111",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#111")}
        onBlur={(e) => (e.target.style.borderColor = "#e7e5e4")}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 500,
            color: "#57534e",
            marginBottom: 5,
          }}
        >
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%",
          border: "1px solid #e7e5e4",
          borderRadius: 10,
          padding: "9px 12px",
          fontSize: 14,
          outline: "none",
          background: "#fafaf9",
          color: "#111",
          resize: "vertical",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#111")}
        onBlur={(e) => (e.target.style.borderColor = "#e7e5e4")}
      />
    </div>
  );
}

// ─── Add Item Form ─────────────────────────────────────────────────────────────
function AddItemForm({
  tripId,
  onAdded,
  onCancel,
}: {
  tripId: string;
  onAdded: (item: ItineraryItem) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    day_date: "",
    time: "",
    type: "note",
    title: "",
    subtitle: "",
    detail: "",
    confirmation_number: "",
    location: "",
  });
  const [saving, setSaving] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleParse() {
    if (!pasteText.trim()) return;
    setParsing(true);
    setParseError("");
    try {
      const res = await fetch("/api/parse-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse");
      setForm({
        type: data.type || "note",
        title: data.title || "",
        subtitle: data.subtitle || "",
        day_date: data.day_date || "",
        time: data.time || "",
        confirmation_number: data.confirmation_number || "",
        location: data.location || "",
        detail: data.detail || "",
      });
      setShowPaste(false);
      setPasteText("");
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : "Could not parse. Fill in manually.");
    } finally {
      setParsing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      const item = await res.json();
      onAdded(item);
    } catch {
      alert("Failed to add item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff",
        border: "2px solid #111",
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>
          Add Itinerary Item
        </h4>
        <button
          type="button"
          onClick={() => { setShowPaste(!showPaste); setParseError(""); }}
          style={{
            background: showPaste ? "#f0fdf4" : "#f3f4f6",
            color: showPaste ? "#16a34a" : "#374151",
            border: showPaste ? "1px solid #bbf7d0" : "1px solid #e7e5e4",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          📋 Paste Confirmation
        </button>
      </div>

      {showPaste && (
        <div style={{
          background: "#f9fafb",
          border: "1px solid #e7e5e4",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "#57534e", fontWeight: 500 }}>
            Paste your booking confirmation below — hotel, flight, restaurant, anything!
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste the full confirmation email or text here…"
            rows={6}
            style={{
              width: "100%",
              border: "1px solid #e7e5e4",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              outline: "none",
              background: "#fff",
              color: "#111",
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
          {parseError && (
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#dc2626" }}>{parseError}</p>
          )}
          <button
            type="button"
            onClick={handleParse}
            disabled={parsing || !pasteText.trim()}
            style={{
              marginTop: 10,
              width: "100%",
              background: parsing || !pasteText.trim() ? "#d1d5db" : "#111",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "10px",
              fontSize: 13,
              fontWeight: 600,
              cursor: parsing || !pasteText.trim() ? "not-allowed" : "pointer",
            }}
          >
            {parsing ? "Reading confirmation…" : "✨ Auto-fill Fields"}
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 500,
              color: "#57534e",
              marginBottom: 5,
            }}
          >
            Type
          </label>
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #e7e5e4",
              borderRadius: 10,
              padding: "9px 12px",
              fontSize: 14,
              outline: "none",
              background: "#fafaf9",
              color: "#111",
              boxSizing: "border-box",
            }}
          >
            {ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Date"
          type="date"
          value={form.day_date}
          onChange={(v) => set("day_date", v)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input
          label="Time (optional)"
          type="time"
          value={form.time}
          onChange={(v) => set("time", v)}
        />
        <Input
          label="Confirmation #"
          value={form.confirmation_number}
          onChange={(v) => set("confirmation_number", v)}
          placeholder="e.g. ABC123"
        />
      </div>

      <Input
        label="Title *"
        value={form.title}
        onChange={(v) => set("title", v)}
        placeholder="e.g. Check-in at Capella Singapore"
        required
      />
      <Input
        label="Subtitle"
        value={form.subtitle}
        onChange={(v) => set("subtitle", v)}
        placeholder="e.g. Premier Garden King Room"
      />
      <Input
        label="Location"
        value={form.location}
        onChange={(v) => set("location", v)}
        placeholder="e.g. 1 The Knolls, Sentosa Island"
      />
      <TextArea
        label="Details"
        value={form.detail}
        onChange={(v) => set("detail", v)}
        placeholder="Additional notes, instructions, or details…"
      />

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            background: "#f3f4f6",
            color: "#57534e",
            border: "1px solid #e7e5e4",
            borderRadius: 999,
            padding: "10px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          style={{
            flex: 2,
            background: saving ? "#78716c" : "#111",
            color: "#fff",
            border: 0,
            borderRadius: 999,
            padding: "10px",
            fontSize: 13,
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Add Item"}
        </button>
      </div>
    </form>
  );
}

// ─── Itinerary Item Card ───────────────────────────────────────────────────────
function ItemCard({
  item,
  tripId,
  isFirst,
  isLast,
  onUpdated,
  onDeleted,
  onMoved,
}: {
  item: ItineraryItem;
  tripId: string;
  isFirst: boolean;
  isLast: boolean;
  onUpdated: (item: ItineraryItem) => void;
  onDeleted: (id: string) => void;
  onMoved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    day_date: item.day_date || "",
    time: item.time || "",
    type: item.type,
    title: item.title,
    subtitle: item.subtitle || "",
    detail: item.detail || "",
    confirmation_number: item.confirmation_number || "",
    location: item.location || "",
  });
  const [saving, setSaving] = useState(false);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      onUpdated(updated);
      setEditing(false);
    } catch {
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await fetch(`/api/trips/${tripId}/items/${item.id}`, { method: "DELETE" });
    onDeleted(item.id);
  }

  async function handleMove(direction: "up" | "down") {
    await fetch(`/api/trips/${tripId}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    onMoved();
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        style={{
          background: "#fff",
          border: "2px solid #111",
          borderRadius: 14,
          padding: 18,
          marginBottom: 8,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "#57534e",
                marginBottom: 5,
              }}
            >
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e7e5e4",
                borderRadius: 10,
                padding: "9px 12px",
                fontSize: 14,
                outline: "none",
                background: "#fafaf9",
                boxSizing: "border-box",
              }}
            >
              {ITEM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Date"
            type="date"
            value={form.day_date}
            onChange={(v) => set("day_date", v)}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input
            label="Time"
            type="time"
            value={form.time}
            onChange={(v) => set("time", v)}
          />
          <Input
            label="Confirmation #"
            value={form.confirmation_number}
            onChange={(v) => set("confirmation_number", v)}
          />
        </div>
        <Input
          label="Title *"
          value={form.title}
          onChange={(v) => set("title", v)}
          required
        />
        <Input
          label="Subtitle"
          value={form.subtitle}
          onChange={(v) => set("subtitle", v)}
        />
        <Input
          label="Location"
          value={form.location}
          onChange={(v) => set("location", v)}
        />
        <TextArea
          label="Details"
          value={form.detail}
          onChange={(v) => set("detail", v)}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{
              flex: 1,
              background: "#f3f4f6",
              color: "#57534e",
              border: "1px solid #e7e5e4",
              borderRadius: 999,
              padding: "9px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 2,
              background: saving ? "#78716c" : "#111",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "9px",
              fontSize: 13,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e7e5e4",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 8,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>
        {TYPE_ICONS[item.type] ?? "📌"}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{item.title}</span>
          {item.time && (
            <span style={{ fontSize: 12, color: "#78716c", whiteSpace: "nowrap" }}>
              {item.time}
            </span>
          )}
        </div>
        {item.subtitle && (
          <p style={{ margin: "0 0 2px", fontSize: 13, color: "#57534e" }}>{item.subtitle}</p>
        )}
        {item.location && (
          <p style={{ margin: "0 0 2px", fontSize: 12, color: "#78716c" }}>📍 {item.location}</p>
        )}
        {item.detail && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#78716c", lineHeight: 1.5 }}>
            {item.detail}
          </p>
        )}
        {item.confirmation_number && (
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#78716c" }}>
            Conf: <strong>{item.confirmation_number}</strong>
          </p>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        <button
          onClick={() => handleMove("up")}
          disabled={isFirst}
          title="Move up"
          style={{
            background: isFirst ? "#f9fafb" : "#f3f4f6",
            border: "1px solid #e7e5e4",
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 11,
            cursor: isFirst ? "not-allowed" : "pointer",
            opacity: isFirst ? 0.4 : 1,
          }}
        >
          ▲
        </button>
        <button
          onClick={() => handleMove("down")}
          disabled={isLast}
          title="Move down"
          style={{
            background: isLast ? "#f9fafb" : "#f3f4f6",
            border: "1px solid #e7e5e4",
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 11,
            cursor: isLast ? "not-allowed" : "pointer",
            opacity: isLast ? 0.4 : 1,
          }}
        >
          ▼
        </button>
        <button
          onClick={() => setEditing(true)}
          title="Edit"
          style={{
            background: "#f3f4f6",
            border: "1px solid #e7e5e4",
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          title="Delete"
          style={{
            background: "#fff0f0",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 11,
            cursor: "pointer",
            color: "#dc2626",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Main Edit Page ────────────────────────────────────────────────────────────
export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [documents, setDocuments] = useState<TripDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [tripForm, setTripForm] = useState<{
    client_name: string;
    destination: string;
    start_date: string;
    end_date: string;
    status: "draft" | "active";
  }>({
    client_name: "",
    destination: "",
    start_date: "",
    end_date: "",
    status: "draft",
  });
  const [savingTrip, setSavingTrip] = useState(false);
  const [tripSaved, setTripSaved] = useState(false);
  const [newUpdate, setNewUpdate] = useState("");
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: "", url: "", doc_type: "" });
  const [savingDoc, setSavingDoc] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        router.push("/");
        return;
      }
      const data: TripWithDetails = await res.json();
      setTrip(data);
      setItems(data.items || []);
      setUpdates(data.updates || []);
      setDocuments(data.documents || []);
      setTripForm({
        client_name: data.client_name,
        destination: data.destination,
        start_date: data.start_date ?? "",
        end_date: data.end_date ?? "",
        status: data.status,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tripId, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveTrip(e: React.FormEvent) {
    e.preventDefault();
    setSavingTrip(true);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripForm),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setTrip(updated);
      setTripSaved(true);
      setTimeout(() => setTripSaved(false), 2500);
    } catch {
      alert("Failed to save trip details.");
    } finally {
      setSavingTrip(false);
    }
  }

  function handleItemAdded(item: ItineraryItem) {
    setItems((prev) => [...prev, item].sort((a, b) => {
      if (a.day_date < b.day_date) return -1;
      if (a.day_date > b.day_date) return 1;
      return a.sort_order - b.sort_order;
    }));
    setShowAddItem(false);
  }

  function handleItemUpdated(updated: ItineraryItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
  }

  function handleItemDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleAddUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!newUpdate.trim()) return;
    setSavingUpdate(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newUpdate }),
      });
      if (!res.ok) throw new Error("Failed");
      const update = await res.json();
      setUpdates((prev) => [update, ...prev]);
      setNewUpdate("");
    } catch {
      alert("Failed to send update.");
    } finally {
      setSavingUpdate(false);
    }
  }

  async function handleAddDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!newDoc.title || !newDoc.url) return;
    setSavingDoc(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc),
      });
      if (!res.ok) throw new Error("Failed");
      const doc = await res.json();
      setDocuments((prev) => [...prev, doc]);
      setNewDoc({ title: "", url: "", doc_type: "" });
    } catch {
      alert("Failed to add document.");
    } finally {
      setSavingDoc(false);
    }
  }

  function copyClientLink() {
    if (!trip) return;
    const url = `${window.location.origin}/trip/${trip.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const dayGroups = groupItemsByDay(items);
  const sortedDays = Array.from(dayGroups.keys()).sort();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f4ef",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
          color: "#78716c",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!trip) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ef",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e7e5e4",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "1px solid #e7e5e4",
              borderRadius: 999,
              padding: "7px 14px",
              fontSize: 13,
              color: "#57534e",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← Back
          </button>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: 17,
                fontWeight: 600,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {trip.client_name}
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "#78716c" }}>{trip.destination}</p>
          </div>
          <button
            onClick={copyClientLink}
            style={{
              background: copied ? "#dcfce7" : "#111",
              color: copied ? "#16a34a" : "#fff",
              border: copied ? "1px solid #bbf7d0" : 0,
              borderRadius: 999,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all .2s",
            }}
          >
            {copied ? "✓ Copied!" : "Copy Client Link"}
          </button>
        </div>
      </header>

      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "28px 24px",
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left column: Trip details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Trip Details Card */}
          <section
            style={{
              background: "#fff",
              border: "1px solid #e7e5e4",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 4px 18px rgba(0,0,0,.05)",
            }}
          >
            <h2
              style={{
                fontSize: 17,
                fontWeight: 600,
                margin: "0 0 20px",
                letterSpacing: "-0.02em",
              }}
            >
              Trip Details
            </h2>
            <form onSubmit={handleSaveTrip}>
              <Input
                label="Client Name *"
                value={tripForm.client_name}
                onChange={(v) => setTripForm((p) => ({ ...p, client_name: v }))}
                placeholder="Jennifer Smith"
                required
              />
              <Input
                label="Destination *"
                value={tripForm.destination}
                onChange={(v) => setTripForm((p) => ({ ...p, destination: v }))}
                placeholder="Tokyo & Kyoto"
                required
              />
              <Input
                label="Start Date"
                type="date"
                value={tripForm.start_date}
                onChange={(v) => setTripForm((p) => ({ ...p, start_date: v }))}
              />
              <Input
                label="End Date"
                type="date"
                value={tripForm.end_date}
                onChange={(v) => setTripForm((p) => ({ ...p, end_date: v }))}
              />

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#57534e",
                    marginBottom: 5,
                  }}
                >
                  Status
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["draft", "active"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTripForm((p) => ({ ...p, status: s }))}
                      style={{
                        flex: 1,
                        padding: "9px",
                        borderRadius: 10,
                        border: tripForm.status === s ? "2px solid #111" : "1px solid #e7e5e4",
                        background: tripForm.status === s ? "#111" : "#fafaf9",
                        color: tripForm.status === s ? "#fff" : "#57534e",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        textTransform: "capitalize" as const,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingTrip}
                style={{
                  width: "100%",
                  background: tripSaved ? "#dcfce7" : savingTrip ? "#78716c" : "#111",
                  color: tripSaved ? "#16a34a" : "#fff",
                  border: tripSaved ? "1px solid #bbf7d0" : 0,
                  borderRadius: 999,
                  padding: "11px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: savingTrip ? "not-allowed" : "pointer",
                  transition: "all .2s",
                }}
              >
                {tripSaved ? "✓ Saved!" : savingTrip ? "Saving…" : "Save Changes"}
              </button>
            </form>

            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: "#f9fafb",
                borderRadius: 10,
                border: "1px solid #e7e5e4",
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: "#78716c" }}>Client link:</p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 12,
                  color: "#57534e",
                  wordBreak: "break-all",
                }}
              >
                /trip/{trip.slug}
              </p>
            </div>
          </section>

          {/* Updates Card */}
          <section
            style={{
              background: "#fff",
              border: "1px solid #e7e5e4",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 4px 18px rgba(0,0,0,.05)",
            }}
          >
            <h2
              style={{
                fontSize: 17,
                fontWeight: 600,
                margin: "0 0 16px",
                letterSpacing: "-0.02em",
              }}
            >
              Updates
            </h2>
            <form onSubmit={handleAddUpdate}>
              <TextArea
                value={newUpdate}
                onChange={setNewUpdate}
                placeholder="Send an update to your client… e.g. 'Flight delayed by 30 minutes'"
                rows={3}
              />
              <button
                type="submit"
                disabled={savingUpdate || !newUpdate.trim()}
                style={{
                  width: "100%",
                  background:
                    savingUpdate || !newUpdate.trim() ? "#d1d5db" : "#111",
                  color: "#fff",
                  border: 0,
                  borderRadius: 999,
                  padding: "10px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    savingUpdate || !newUpdate.trim() ? "not-allowed" : "pointer",
                }}
              >
                {savingUpdate ? "Sending…" : "Send Update"}
              </button>
            </form>

            {updates.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {updates.map((u) => (
                  <div
                    key={u.id}
                    style={{
                      background: "#f9fafb",
                      border: "1px solid #e7e5e4",
                      borderRadius: 10,
                      padding: "10px 12px",
                    }}
                  >
                    <p style={{ margin: "0 0 4px", fontSize: 13, lineHeight: 1.5 }}>
                      {u.message}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "#78716c" }}>
                      {new Date(u.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Documents Card */}
          <section
            style={{
              background: "#fff",
              border: "1px solid #e7e5e4",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 4px 18px rgba(0,0,0,.05)",
            }}
          >
            <h2
              style={{
                fontSize: 17,
                fontWeight: 600,
                margin: "0 0 16px",
                letterSpacing: "-0.02em",
              }}
            >
              Documents
            </h2>
            <form onSubmit={handleAddDoc}>
              <Input
                label="Title"
                value={newDoc.title}
                onChange={(v) => setNewDoc((p) => ({ ...p, title: v }))}
                placeholder="e.g. Flight Confirmation"
              />
              <Input
                label="URL"
                type="url"
                value={newDoc.url}
                onChange={(v) => setNewDoc((p) => ({ ...p, url: v }))}
                placeholder="https://…"
              />
              <Input
                label="Type (optional)"
                value={newDoc.doc_type}
                onChange={(v) => setNewDoc((p) => ({ ...p, doc_type: v }))}
                placeholder="e.g. PDF, Booking, Visa"
              />
              <button
                type="submit"
                disabled={savingDoc || !newDoc.title || !newDoc.url}
                style={{
                  width: "100%",
                  background:
                    savingDoc || !newDoc.title || !newDoc.url ? "#d1d5db" : "#111",
                  color: "#fff",
                  border: 0,
                  borderRadius: 999,
                  padding: "10px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    savingDoc || !newDoc.title || !newDoc.url ? "not-allowed" : "pointer",
                }}
              >
                {savingDoc ? "Adding…" : "Add Document"}
              </button>
            </form>

            {documents.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "#f9fafb",
                      border: "1px solid #e7e5e4",
                      borderRadius: 10,
                      padding: "10px 12px",
                      textDecoration: "none",
                      color: "#111",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>📄</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {doc.title}
                      </p>
                      {doc.doc_type && (
                        <p style={{ margin: 0, fontSize: 11, color: "#78716c" }}>
                          {doc.doc_type}
                        </p>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: "#78716c" }}>↗</span>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column: Itinerary items */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              Itinerary
            </h2>
            {!showAddItem && (
              <button
                onClick={() => setShowAddItem(true)}
                style={{
                  background: "#111",
                  color: "#fff",
                  border: 0,
                  borderRadius: 999,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 16 }}>+</span> Add Item
              </button>
            )}
          </div>

          {showAddItem && (
            <AddItemForm
              tripId={tripId}
              onAdded={handleItemAdded}
              onCancel={() => setShowAddItem(false)}
            />
          )}

          {items.length === 0 && !showAddItem && (
            <div
              style={{
                background: "#fff",
                border: "1px dashed #d1d5db",
                borderRadius: 16,
                padding: "48px 24px",
                textAlign: "center",
                color: "#78716c",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>🗓️</div>
              <p style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 500 }}>
                No itinerary items yet
              </p>
              <p style={{ margin: "0 0 20px", fontSize: 13 }}>
                Click "Add Item" to start building the itinerary
              </p>
              <button
                onClick={() => setShowAddItem(true)}
                style={{
                  background: "#111",
                  color: "#fff",
                  border: 0,
                  borderRadius: 999,
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Add first item
              </button>
            </div>
          )}

          {sortedDays.map((day) => {
            const dayItems = dayGroups.get(day)!;
            return (
              <div key={day} style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      background: "#111",
                      color: "#fff",
                      borderRadius: 999,
                      padding: "4px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {day === "no-date" ? "No Date Set" : formatDate(day)}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "#e7e5e4",
                    }}
                  />
                </div>
                {dayItems.map((item, idx) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    tripId={tripId}
                    isFirst={idx === 0}
                    isLast={idx === dayItems.length - 1}
                    onUpdated={handleItemUpdated}
                    onDeleted={handleItemDeleted}
                    onMoved={load}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
