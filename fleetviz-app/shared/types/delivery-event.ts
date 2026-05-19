export interface DeliveryEvent {
  sequence: number;
  order_id: string;
  location_id: number;
  event_id: string;
  event_type: string;
  ts: string;
  loc_lat: number;
  loc_lon: number;
  progress_pct: number | null;
}

export interface MapEventsTimeRange {
  min: string;
  max: string;
}

export interface MapEventsResponse {
  events: DeliveryEvent[];
  table: string;
  timeRange: MapEventsTimeRange | null;
}
