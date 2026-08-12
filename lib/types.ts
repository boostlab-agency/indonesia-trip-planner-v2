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
  created_at: string;
  updated_at: string;
}

export interface Accommodation {
  id: string;
  destination_id: string | null;
  name: string;
  address: string | null;
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
  price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  currency: string;
  paid_by: string | null;
  item_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
