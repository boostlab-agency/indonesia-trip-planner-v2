export type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export interface Destination {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  sort_order: number;
  lat: number | null;
  lng: number | null;
  cover_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Accommodation {
  id: string;
  destination_id: string | null;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  cover_photo_url: string | null;
  check_in: string | null;
  check_out: string | null;
  price: number | null;
  booking_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TransportType = "flight" | "train" | "bus" | "car" | "ferry" | "other";

export interface Transport {
  id: string;
  destination_id: string | null;
  type: TransportType;
  from_location: string | null;
  to_location: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  price: number | null;
  booking_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  destination_id: string | null;
  name: string;
  activity_date: string | null;
  activity_time: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  destination_id: string | null;
  activity_id: string | null;
  category: string;
  description: string | null;
  amount: number;
  currency: string;
  paid_by: string | null;
  paid_for: string | null;
  item_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LinkItem {
  id: string;
  destination_id: string | null;
  title: string;
  url: string;
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  destination_id: string | null;
  activity_id: string | null;
  accommodation_id: string | null;
  storage_path: string;
  caption: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  destination_id: string | null;
  body: string;
  created_at: string;
}

export interface PersonBalance {
  name: string;
  paid: number;
  fairShare: number;
  balance: number;
}

export interface BudgetSummary {
  total: number;
  currency: string;
  people: PersonBalance[];
  settlement: { from: string; to: string; amount: number } | null;
}
