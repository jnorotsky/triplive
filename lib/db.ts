import { sql } from "@vercel/postgres";
import type { Trip, ItineraryItem, Update, Document, TripWithDetails } from "./types";

let initialized = false;

export async function initDB(): Promise<void> {
  if (initialized) return;
  initialized = true;

  await sql`
    CREATE TABLE IF NOT EXISTS trips (
      id          UUID PRIMARY KEY,
      slug        TEXT UNIQUE NOT NULL,
      client_name TEXT NOT NULL,
      destination TEXT NOT NULL,
      start_date  DATE,
      end_date    DATE,
      status      TEXT NOT NULL DEFAULT 'draft',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS itinerary_items (
      id                  UUID PRIMARY KEY,
      trip_id             UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      day_date            DATE,
      time                TEXT,
      type                TEXT NOT NULL DEFAULT 'note',
      title               TEXT NOT NULL,
      subtitle            TEXT,
      detail              TEXT,
      confirmation_number TEXT,
      location            TEXT,
      sort_order          INTEGER NOT NULL DEFAULT 0,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS updates (
      id         UUID PRIMARY KEY,
      trip_id    UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      message    TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id         UUID PRIMARY KEY,
      trip_id    UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      title      TEXT NOT NULL,
      url        TEXT NOT NULL,
      doc_type   TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

// ─── Trips ────────────────────────────────────────────────────────────────────

export async function getAllTrips(): Promise<Trip[]> {
  await initDB();
  const { rows } = await sql`
    SELECT * FROM trips ORDER BY created_at DESC
  `;
  return rows as Trip[];
}

export async function getTripById(id: string): Promise<Trip | null> {
  await initDB();
  const { rows } = await sql`
    SELECT * FROM trips WHERE id = ${id}
  `;
  return (rows[0] as Trip) ?? null;
}

export async function getTripBySlug(slug: string): Promise<Trip | null> {
  await initDB();
  const { rows } = await sql`
    SELECT * FROM trips WHERE slug = ${slug}
  `;
  return (rows[0] as Trip) ?? null;
}

export async function getTripWithDetails(id: string): Promise<TripWithDetails | null> {
  await initDB();
  const trip = await getTripById(id);
  if (!trip) return null;

  const [{ rows: items }, { rows: updates }, { rows: documents }] =
    await Promise.all([
      sql`SELECT * FROM itinerary_items WHERE trip_id = ${id} ORDER BY day_date ASC, sort_order ASC, time ASC`,
      sql`SELECT * FROM updates WHERE trip_id = ${id} ORDER BY created_at DESC`,
      sql`SELECT * FROM documents WHERE trip_id = ${id} ORDER BY created_at ASC`,
    ]);

  return {
    ...trip,
    items: items as ItineraryItem[],
    updates: updates as Update[],
    documents: documents as Document[],
  };
}

export async function getTripWithDetailsBySlug(slug: string): Promise<TripWithDetails | null> {
  await initDB();
  const trip = await getTripBySlug(slug);
  if (!trip) return null;
  return getTripWithDetails(trip.id);
}

export async function createTrip(data: {
  id: string;
  slug: string;
  client_name: string;
  destination: string;
  start_date: string;
  end_date: string;
}): Promise<Trip> {
  await initDB();
  const { rows } = await sql`
    INSERT INTO trips (id, slug, client_name, destination, start_date, end_date, status)
    VALUES (${data.id}, ${data.slug}, ${data.client_name}, ${data.destination}, ${data.start_date || null}, ${data.end_date || null}, 'draft')
    RETURNING *
  `;
  return rows[0] as Trip;
}

export async function updateTrip(
  id: string,
  data: Partial<Pick<Trip, "client_name" | "destination" | "start_date" | "end_date" | "status">>
): Promise<Trip | null> {
  await initDB();
  const current = await getTripById(id);
  if (!current) return null;

  const client_name = data.client_name ?? current.client_name;
  const destination = data.destination ?? current.destination;
  const start_date = data.start_date ?? current.start_date;
  const end_date = data.end_date ?? current.end_date;
  const status = data.status ?? current.status;

  const { rows } = await sql`
    UPDATE trips
    SET client_name = ${client_name},
        destination = ${destination},
        start_date  = ${start_date || null},
        end_date    = ${end_date || null},
        status      = ${status}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] as Trip;
}

export async function deleteTrip(id: string): Promise<void> {
  await initDB();
  await sql`DELETE FROM trips WHERE id = ${id}`;
}

// ─── Itinerary Items ──────────────────────────────────────────────────────────

export async function getItemsByTrip(tripId: string): Promise<ItineraryItem[]> {
  await initDB();
  const { rows } = await sql`
    SELECT * FROM itinerary_items
    WHERE trip_id = ${tripId}
    ORDER BY day_date ASC, sort_order ASC, time ASC
  `;
  return rows as ItineraryItem[];
}

export async function createItem(data: {
  id: string;
  trip_id: string;
  day_date: string;
  time: string;
  type: string;
  title: string;
  subtitle: string;
  detail: string;
  confirmation_number: string;
  location: string;
  sort_order: number;
}): Promise<ItineraryItem> {
  await initDB();
  const { rows } = await sql`
    INSERT INTO itinerary_items
      (id, trip_id, day_date, time, type, title, subtitle, detail, confirmation_number, location, sort_order)
    VALUES
      (${data.id}, ${data.trip_id}, ${data.day_date || null}, ${data.time || null},
       ${data.type}, ${data.title}, ${data.subtitle || null}, ${data.detail || null},
       ${data.confirmation_number || null}, ${data.location || null}, ${data.sort_order})
    RETURNING *
  `;
  return rows[0] as ItineraryItem;
}

export async function updateItem(
  itemId: string,
  data: Partial<Omit<ItineraryItem, "id" | "trip_id" | "created_at">>
): Promise<ItineraryItem | null> {
  await initDB();
  const { rows: existing } = await sql`SELECT * FROM itinerary_items WHERE id = ${itemId}`;
  if (!existing[0]) return null;
  const cur = existing[0] as ItineraryItem;

  const day_date = data.day_date !== undefined ? data.day_date : cur.day_date;
  const time = data.time !== undefined ? data.time : cur.time;
  const type = data.type ?? cur.type;
  const title = data.title ?? cur.title;
  const subtitle = data.subtitle !== undefined ? data.subtitle : cur.subtitle;
  const detail = data.detail !== undefined ? data.detail : cur.detail;
  const confirmation_number = data.confirmation_number !== undefined ? data.confirmation_number : cur.confirmation_number;
  const location = data.location !== undefined ? data.location : cur.location;
  const sort_order = data.sort_order !== undefined ? data.sort_order : cur.sort_order;

  const { rows } = await sql`
    UPDATE itinerary_items
    SET day_date = ${day_date || null},
        time = ${time || null},
        type = ${type},
        title = ${title},
        subtitle = ${subtitle || null},
        detail = ${detail || null},
        confirmation_number = ${confirmation_number || null},
        location = ${location || null},
        sort_order = ${sort_order}
    WHERE id = ${itemId}
    RETURNING *
  `;
  return rows[0] as ItineraryItem;
}

export async function deleteItem(itemId: string): Promise<void> {
  await initDB();
  await sql`DELETE FROM itinerary_items WHERE id = ${itemId}`;
}

// ─── Updates ──────────────────────────────────────────────────────────────────

export async function createUpdate(data: {
  id: string;
  trip_id: string;
  message: string;
}): Promise<Update> {
  await initDB();
  const { rows } = await sql`
    INSERT INTO updates (id, trip_id, message)
    VALUES (${data.id}, ${data.trip_id}, ${data.message})
    RETURNING *
  `;
  return rows[0] as Update;
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function createDocument(data: {
  id: string;
  trip_id: string;
  title: string;
  url: string;
  doc_type: string;
}): Promise<Document> {
  await initDB();
  const { rows } = await sql`
    INSERT INTO documents (id, trip_id, title, url, doc_type)
    VALUES (${data.id}, ${data.trip_id}, ${data.title}, ${data.url}, ${data.doc_type || null})
    RETURNING *
  `;
  return rows[0] as Document;
}
