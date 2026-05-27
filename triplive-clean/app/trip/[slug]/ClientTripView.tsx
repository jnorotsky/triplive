"use client";

import { useState } from "react";
import type { TripWithDetails, ItineraryItem, Update, TripDocument } from "@/lib/types";
import { formatDate, typeIcon } from "@/lib/utils";

const TABS = ["Today", "Itinerary", "Updates", "Docs"] as const;
type Tab = typeof TABS[number];

// ─── Hero Card ────────────────────────────────────────────────────────────────
function HeroCard({ trip }: { trip: TripWithDetails }) {
  function formatRange(start?: string | null, end?: string | null): string {
    if (!start && !end) return "";
    const fmt = (d: string) => {
      const [y, m, day] = d.split("-").map(Number);
      return new Date(y, m - 1, day).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    };
    if (start && end) return `${fmt(start)} – ${fmt(end)}`;
    if (start) return fmt(start);
    return fmt(end!);
  }

  return (
    <div
      style={{
        background: "#111",
        color: "#fff",
        borderRadius: 28,
        padding: "28px 24px",
        boxShadow: "0 12px 36px rgba(0,0,0,.18)",
        marginBottom: 16,
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#a8a29e",
          fontWeight: 600,
        }}
      >
        Private Itinerary
      </p>
      <h1
        style={{
          margin: "0 0 4px",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
        }}
      >
        {trip.client_name}
      </h1>
      <p
        style={{
          margin: "0 0 4px",
          fontSize: 18,
          color: "#d6d3d1",
          fontWeight: 500,
          letterSpacing: "-0.02em",
        }}
      >
        {trip.destination}
      </p>
      {(trip.start_date || trip.end_date) && (
        <p style={{ margin: 0, fontSize: 13, color: "#a8a29e" }}>
          {formatRange(trip.start_date, trip.end_date)}
        </p>
      )}
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
function TabBar({
  active,
  onChange,
  todayCount,
  updateCount,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
  todayCount: number;
  updateCount: number;
}) {
  return (
    <nav
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 6,
        marginBottom: 20,
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab === active;
        const badge =
          tab === "Today" && todayCount > 0
            ? todayCount
            : tab === "Updates" && updateCount > 0
            ? updateCount
            : null;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              background: isActive ? "#111" : "#fff",
              color: isActive ? "#fff" : "#57534e",
              border: isActive ? 0 : "1px solid #e7e5e4",
              borderRadius: 999,
              padding: "10px 4px",
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              cursor: "pointer",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            {tab}
            {badge !== null && (
              <span
                style={{
                  background: isActive ? "#fff" : "#111",
                  color: isActive ? "#111" : "#fff",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 5px",
                  lineHeight: "14px",
                }}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─── Single Item Card ─────────────────────────────────────────────────────────
function ItemCard({ item }: { item: ItineraryItem }) {
  // Format a date like "May 26"
  function shortDate(d: string): string {
    const [y, m, day] = d.split("-").map(Number);
    if (!y || !m || !day) return "";
    return new Date(y, m - 1, day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  const showCheckout = item.type === "hotel" && item.end_date;

  // Split the detail blob into clean bullet lines.
  // Supports newline-separated, bullet-prefixed, or sentence-separated input.
  const detailLines: string[] = [];
  if (item.detail) {
    let raw = item.detail.trim();
    if (raw.includes("\n")) {
      raw.split("\n").forEach((line) => {
        const cleaned = line.trim().replace(/^[•\-*]\s*/, "");
        if (cleaned) detailLines.push(cleaned);
      });
    } else {
      // Fall back: split on ". " before a capital letter, keep each as its own line
      raw
        .split(/\.\s+(?=[A-Z(])/)
        .forEach((piece) => {
          const cleaned = piece.trim().replace(/\.$/, "");
          if (cleaned) detailLines.push(cleaned);
        });
    }
  }

  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid #e7e5e4",
        borderRadius: 20,
        padding: "18px 20px",
        boxShadow: "0 4px 18px rgba(0,0,0,.05)",
      }}
    >
      {/* Header row: icon + title (+ time pill for non-hotels) */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <span style={{ fontSize: 28, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>
          {typeIcon(item.type)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
                color: "#111",
              }}
            >
              {item.title}
            </h3>
            {item.time && !showCheckout && (
              <span
                style={{
                  fontSize: 12,
                  color: "#111",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  background: "#f3f4f6",
                  padding: "3px 10px",
                  borderRadius: 999,
                  flexShrink: 0,
                }}
              >
                {item.time}
              </span>
            )}
          </div>
          {/* Subtitle (room type, cabin class, party size, etc.) — BOLD */}
          {item.subtitle && (
            <p
              style={{
                margin: "5px 0 0",
                fontSize: 14,
                fontWeight: 600,
                color: "#1f2937",
                lineHeight: 1.4,
              }}
            >
              {item.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Check-in → Check-out block for hotels — BOLD dates */}
      {showCheckout && (
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            background: "#fafaf9",
            border: "1px solid #e7e5e4",
            borderRadius: 12,
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                color: "#78716c",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              Check-in
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 15,
                fontWeight: 700,
                color: "#111",
                lineHeight: 1.2,
              }}
            >
              {shortDate(item.day_date)}
              {item.time && (
                <span style={{ fontWeight: 500, color: "#57534e", fontSize: 13 }}>
                  {" · "}{item.time}
                </span>
              )}
            </p>
          </div>
          <div style={{ color: "#a8a29e", fontSize: 18, flexShrink: 0 }}>→</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                color: "#78716c",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              Check-out
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 15,
                fontWeight: 700,
                color: "#111",
                lineHeight: 1.2,
              }}
            >
              {shortDate(item.end_date!)}
            </p>
          </div>
        </div>
      )}

      {/* Location — always shown */}
      {item.location && (
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 13,
            color: "#57534e",
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            lineHeight: 1.5,
          }}
        >
          <span style={{ flexShrink: 0 }}>📍</span>
          <span>{item.location}</span>
        </p>
      )}

      {/* Details as bullets — always shown */}
      {detailLines.length > 0 && (
        <ul
          style={{
            margin: "12px 0 0",
            paddingLeft: 22,
            fontSize: 13,
            color: "#57534e",
            lineHeight: 1.55,
          }}
        >
          {detailLines.map((line, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              {line}
            </li>
          ))}
        </ul>
      )}

      {/* Confirmation # — always shown, BOLD value */}
      {item.confirmation_number && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 10,
            display: "inline-block",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              color: "#92400e",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 600,
            }}
          >
            Confirmation #
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "#111",
            }}
          >
            {item.confirmation_number}
          </p>
        </div>
      )}
    </article>
  );
}

// ─── Day Section ──────────────────────────────────────────────────────────────
function DaySection({ date, items }: { date: string; items: ItineraryItem[] }) {
  // Split into weekday ("Tuesday") and rest ("May 19")
  let weekday = "";
  let rest = "Other";
  if (date !== "no-date") {
    const [y, m, day] = date.split("-").map(Number);
    if (y && m && day) {
      const dt = new Date(y, m - 1, day);
      weekday = dt.toLocaleDateString("en-US", { weekday: "long" });
      rest = dt.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    } else {
      rest = formatDate(date);
    }
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          marginBottom: 14,
          paddingBottom: 10,
          borderBottom: "2px solid #111",
        }}
      >
        {weekday && (
          <h2
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "#78716c",
            }}
          >
            {weekday}
          </h2>
        )}
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#111",
          }}
        >
          {rest}
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

// ─── Today Tab ────────────────────────────────────────────────────────────────
function TodayTab({
  items,
  today,
}: {
  items: ItineraryItem[];
  today: string;
}) {
  const todayItems = items.filter((i) => i.day_date === today);

  if (todayItems.length === 0) {
    const upcomingItems = items.filter((i) => i.day_date > today);
    const nextDate = upcomingItems[0]?.day_date;

    return (
      <div style={{ paddingTop: 8 }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e7e5e4",
            borderRadius: 20,
            padding: 28,
            textAlign: "center",
            boxShadow: "0 4px 18px rgba(0,0,0,.05)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>☀️</div>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            No events today
          </h3>
          {nextDate ? (
            <p style={{ margin: 0, fontSize: 14, color: "#78716c" }}>
              Your next activity is on {formatDate(nextDate)}
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "#78716c" }}>
              Check the Itinerary tab for your full schedule
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
      {todayItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

// ─── Itinerary Tab ────────────────────────────────────────────────────────────
function ItineraryTab({ items }: { items: ItineraryItem[] }) {
  if (items.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e7e5e4",
          borderRadius: 20,
          padding: 28,
          textAlign: "center",
          boxShadow: "0 4px 18px rgba(0,0,0,.05)",
          marginTop: 8,
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗓️</div>
        <p style={{ margin: 0, fontSize: 15, color: "#78716c" }}>
          Your itinerary is being prepared. Check back soon!
        </p>
      </div>
    );
  }

  // Group by day
  const grouped = new Map<string, ItineraryItem[]>();
  for (const item of items) {
    const key = item.day_date || "no-date";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }
  const sortedDays = Array.from(grouped.keys()).sort((a, b) => {
    if (a === "no-date") return 1;
    if (b === "no-date") return -1;
    return a < b ? -1 : 1;
  });

  return (
    <div style={{ paddingTop: 8 }}>
      {sortedDays.map((day) => (
        <DaySection key={day} date={day} items={grouped.get(day)!} />
      ))}
    </div>
  );
}

// ─── Updates Tab ──────────────────────────────────────────────────────────────
function UpdatesTab({ updates }: { updates: Update[] }) {
  if (updates.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e7e5e4",
          borderRadius: 20,
          padding: 28,
          textAlign: "center",
          boxShadow: "0 4px 18px rgba(0,0,0,.05)",
          marginTop: 8,
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
        <p style={{ margin: 0, fontSize: 15, color: "#78716c" }}>
          No updates yet. Your advisor will post messages here.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingTop: 8,
      }}
    >
      {updates.map((update) => {
        const date = new Date(update.created_at);
        const label = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <article
            key={update.id}
            style={{
              background: "#fff",
              border: "1px solid #e7e5e4",
              borderRadius: 20,
              padding: "18px 20px",
              boxShadow: "0 4px 18px rgba(0,0,0,.05)",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontSize: 15,
                lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}
            >
              {update.message}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "#78716c",
              }}
            >
              {label}
            </p>
          </article>
        );
      })}
    </div>
  );
}

// ─── Docs Tab ─────────────────────────────────────────────────────────────────
function DocsTab({ documents }: { documents: TripDocument[] }) {
  if (documents.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e7e5e4",
          borderRadius: 20,
          padding: 28,
          textAlign: "center",
          boxShadow: "0 4px 18px rgba(0,0,0,.05)",
          marginTop: 8,
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
        <p style={{ margin: 0, fontSize: 15, color: "#78716c" }}>
          No documents yet. Your advisor will add links here.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingTop: 8,
      }}
    >
      {documents.map((doc) => (
        <a
          key={doc.id}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "#fff",
            border: "1px solid #e7e5e4",
            borderRadius: 20,
            padding: "16px 18px",
            boxShadow: "0 4px 18px rgba(0,0,0,.05)",
            textDecoration: "none",
            color: "#111",
          }}
        >
          <span
            style={{
              fontSize: 28,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            📄
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: "0 0 3px",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {doc.title}
            </p>
            {doc.doc_type && (
              <p style={{ margin: 0, fontSize: 12, color: "#78716c" }}>{doc.doc_type}</p>
            )}
          </div>
          <span
            style={{
              fontSize: 18,
              color: "#78716c",
              flexShrink: 0,
            }}
          >
            ↗
          </span>
        </a>
      ))}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export default function ClientTripView({
  trip,
  today,
}: {
  trip: TripWithDetails;
  today: string;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Today");

  const todayCount = trip.items.filter((i) => i.day_date === today).length;
  const updateCount = trip.updates.length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ef",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
        padding: "24px 20px 48px",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* TripLive branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "#78716c",
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            TRIPLIVE
          </span>
        </div>

        <HeroCard trip={trip} />

        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          todayCount={todayCount}
          updateCount={updateCount}
        />

        {activeTab === "Today" && (
          <TodayTab items={trip.items} today={today} />
        )}
        {activeTab === "Itinerary" && <ItineraryTab items={trip.items} />}
        {activeTab === "Updates" && <UpdatesTab updates={trip.updates} />}
        {activeTab === "Docs" && <DocsTab documents={trip.documents} />}

        {/* Footer */}
        <div
          style={{
            marginTop: 40,
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: 11, color: "#a8a29e", letterSpacing: "0.08em" }}>
            Powered by TripLive
          </p>
        </div>
      </div>
    </main>
  );
}
