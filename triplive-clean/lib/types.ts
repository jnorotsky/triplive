export interface Trip {
  id: string;
  slug: string;
  client_name: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  status: "draft" | "active";
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  day_date: string;
  time: string | null;
  type: "hotel" | "flight" | "activity" | "restaurant" | "transfer" | "note";
  title: string;
  subtitle: string | null;
  detail: string | null;
  confirmation_number: string | null;
  location: string | null;
  sort_order: number;
  created_at: string;
}

export interface Update {
  id: string;
  trip_id: string;
  message: string;
  created_at: string;
}

export interface TripDocument {
  id: string;
  trip_id: string;
  title: string;
  url: string;
  doc_type: string | null;
  created_at: string;
}

export interface TripWithDetails extends Trip {
  items: ItineraryItem[];
  updates: Update[];
  documents: TripDocument[];
}
