"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Trip } from "@/lib/types";

function statusBadge(status: string) {
  const isActive = status === "active";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
        background: isActive ? "#dcfce7" : "#f3f4f6",
        color: isActive ? "#16a34a" : "#6b7280",
        border: `1px solid ${isActive ? "#bbf7d0" : "#e5e7eb"}`,
      }}
    >
      {status}
    </span>
  );
}

function formatTripDates(start?: string, end?: string): string {
  if (!start && !end) return "Dates TBD";
  const fmt = (d: string) => {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  return `Until ${fmt(end!)}`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTrip, setNewTrip] = useState({
    client_name: "",
    destination: "",
    start_date: "",
    end_date: "",
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    try {
      const res = await fetch("/api/trips");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setTrips(data);
    } catch (err) {
      console.error("Failed to load trips", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  async function handleCreateTrip(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrip),
      });
      if (!res.ok) throw new Error("Failed");
      const trip = await res.json();
      setTrips((prev) => [trip, ...prev]);
      setShowNewModal(false);
      setNewTrip({ client_name: "", destination: "", start_date: "", end_date: "" });
      router.push(`/admin/${trip.id}`);
    } catch {
      alert("Failed to create trip. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  function copyClientLink(slug: string) {
    const url = `${window.location.origin}/trip/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(slug);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/trips/${id}`, { method: "DELETE" });
      setTrips((prev) => prev.filter((t) => t.id !== id));
      setDeleteConfirm(null);
    } catch {
      alert("Failed to delete trip.");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

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
            maxWidth: 1100,
            margin: "0 auto",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                margin: 0,
              }}
            >
              TripLive
            </h1>
            <span
              style={{
                fontSize: 12,
                color: "#78716c",
                background: "#f3f4f6",
                padding: "2px 8px",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
              }}
            >
              Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "1px solid #e7e5e4",
              borderRadius: 999,
              padding: "8px 16px",
              fontSize: 13,
              color: "#57534e",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {/* Page title + New Trip button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                margin: "0 0 4px",
              }}
            >
              All Trips
            </h2>
            <p style={{ color: "#78716c", margin: 0, fontSize: 14 }}>
              {trips.length} {trips.length === 1 ? "trip" : "trips"} total
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            style={{
              background: "#111",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Trip
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "#78716c",
              fontSize: 15,
            }}
          >
            Loading trips…
          </div>
        )}

        {/* Empty state */}
        {!loading && trips.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              background: "#fff",
              border: "1px solid #e7e5e4",
              borderRadius: 24,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              No trips yet
            </h3>
            <p style={{ color: "#78716c", margin: "0 0 24px" }}>
              Create your first client itinerary to get started
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              style={{
                background: "#111",
                color: "#fff",
                border: 0,
                borderRadius: 999,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Create first trip
            </button>
          </div>
        )}

        {/* Trip grid */}
        {!loading && trips.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {trips.map((trip) => (
              <div
                key={trip.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e7e5e4",
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: "0 4px 18px rgba(0,0,0,.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {/* Trip info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      gap: 8,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        margin: 0,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.3,
                      }}
                    >
                      {trip.client_name}
                    </h3>
                    {statusBadge(trip.status)}
                  </div>
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: 15,
                      color: "#57534e",
                      fontWeight: 500,
                    }}
                  >
                    {trip.destination}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: "#78716c" }}>
                    {formatTripDates(trip.start_date, trip.end_date)}
                  </p>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => router.push(`/admin/${trip.id}`)}
                    style={{
                      flex: 1,
                      background: "#111",
                      color: "#fff",
                      border: 0,
                      borderRadius: 999,
                      padding: "10px 14px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      minWidth: 70,
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => copyClientLink(trip.slug)}
                    style={{
                      flex: 1,
                      background: copied === trip.slug ? "#dcfce7" : "#f3f4f6",
                      color: copied === trip.slug ? "#16a34a" : "#57534e",
                      border: `1px solid ${copied === trip.slug ? "#bbf7d0" : "#e7e5e4"}`,
                      borderRadius: 999,
                      padding: "10px 14px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      minWidth: 70,
                      transition: "all .2s",
                    }}
                  >
                    {copied === trip.slug ? "Copied!" : "Copy Link"}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(trip.id)}
                    style={{
                      background: "none",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: 999,
                      padding: "10px 12px",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                    title="Delete trip"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Trip Modal */}
      {showNewModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 24,
          }}
          onClick={(e) => e.target === e.currentTarget && setShowNewModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 32,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 20px 60px rgba(0,0,0,.15)",
            }}
          >
            <h3
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                margin: "0 0 6px",
              }}
            >
              New Trip
            </h3>
            <p style={{ color: "#78716c", margin: "0 0 28px", fontSize: 14 }}>
              Fill in the basics — you can add itinerary items after.
            </p>

            <form onSubmit={handleCreateTrip}>
              <Field
                label="Client Name *"
                type="text"
                value={newTrip.client_name}
                onChange={(v) => setNewTrip((p) => ({ ...p, client_name: v }))}
                placeholder="e.g. Jennifer Smith"
                required
              />
              <Field
                label="Destination *"
                type="text"
                value={newTrip.destination}
                onChange={(v) => setNewTrip((p) => ({ ...p, destination: v }))}
                placeholder="e.g. Tokyo & Kyoto"
                required
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field
                  label="Start Date"
                  type="date"
                  value={newTrip.start_date}
                  onChange={(v) => setNewTrip((p) => ({ ...p, start_date: v }))}
                />
                <Field
                  label="End Date"
                  type="date"
                  value={newTrip.end_date}
                  onChange={(v) => setNewTrip((p) => ({ ...p, end_date: v }))}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{
                    flex: 1,
                    background: "#f3f4f6",
                    color: "#57534e",
                    border: "1px solid #e7e5e4",
                    borderRadius: 999,
                    padding: "12px 20px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    flex: 2,
                    background: creating ? "#78716c" : "#111",
                    color: "#fff",
                    border: 0,
                    borderRadius: 999,
                    padding: "12px 20px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: creating ? "not-allowed" : "pointer",
                  }}
                >
                  {creating ? "Creating…" : "Create Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 32,
              width: "100%",
              maxWidth: 380,
              boxShadow: "0 20px 60px rgba(0,0,0,.15)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 16 }}>🗑️</div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              Delete trip?
            </h3>
            <p style={{ color: "#78716c", margin: "0 0 24px", fontSize: 14 }}>
              This will permanently delete the trip and all its itinerary items. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  background: "#f3f4f6",
                  color: "#57534e",
                  border: "1px solid #e7e5e4",
                  borderRadius: 999,
                  padding: "12px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  flex: 1,
                  background: "#dc2626",
                  color: "#fff",
                  border: 0,
                  borderRadius: 999,
                  padding: "12px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Reusable form field component
function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 500,
          color: "#57534e",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          border: "1px solid #e7e5e4",
          borderRadius: 12,
          padding: "11px 14px",
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
