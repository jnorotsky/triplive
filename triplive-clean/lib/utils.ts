/**
 * Converts a client name + random suffix into a URL-safe slug.
 * e.g. "Jennifer Smith" => "jennifer-smith-x4k9m2"
 */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }

  return `${base}-${suffix}`;
}

/**
 * Format a date string (YYYY-MM-DD) into a readable label like "Monday, May 26"
 */
export function formatDate(dateStr: string): string {
  // Parse as local date by splitting manually to avoid timezone offsets
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date string short: "May 26"
 */
export function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Get today's date as YYYY-MM-DD in local time
 */
export function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns the icon emoji for an itinerary item type
 */
export function typeIcon(type: string): string {
  const icons: Record<string, string> = {
    hotel: "🏨",
    flight: "✈️",
    activity: "🎭",
    restaurant: "🍽️",
    transfer: "🚗",
    note: "📝",
  };
  return icons[type] ?? "📌";
}
