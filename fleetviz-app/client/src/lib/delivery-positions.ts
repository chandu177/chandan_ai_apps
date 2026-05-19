import type { DeliveryEvent } from '@shared/types/delivery-event';
import { parseEventTime } from '@/lib/datetime';

export type OrderTrack = DeliveryEvent[];

export { parseEventTime };

/** Group events by order_id, each track sorted ascending by time. */
export function buildTracks(events: DeliveryEvent[]): Map<string, OrderTrack> {
  const tracks = new Map<string, OrderTrack>();
  for (const event of events) {
    const list = tracks.get(event.order_id) ?? [];
    list.push(event);
    tracks.set(event.order_id, list);
  }
  for (const list of tracks.values()) {
    list.sort((a, b) => parseEventTime(a.ts) - parseEventTime(b.ts));
  }
  return tracks;
}

/** Last event in track with ts <= atMs, or null if none. */
export function lastEventAtOrBefore(track: OrderTrack, atMs: number): DeliveryEvent | null {
  if (track.length === 0) return null;

  let lo = 0;
  let hi = track.length - 1;
  let result: DeliveryEvent | null = null;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const t = parseEventTime(track[mid].ts);
    if (t <= atMs) {
      result = track[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return result;
}

export interface DeliveryPosition {
  order_id: string;
  event: DeliveryEvent;
}

/** One position per order at the given instant. */
export function getPositionsAtTime(
  tracks: Map<string, OrderTrack>,
  atMs: number,
): DeliveryPosition[] {
  const positions: DeliveryPosition[] = [];
  for (const [order_id, track] of tracks) {
    const event = lastEventAtOrBefore(track, atMs);
    if (event) {
      positions.push({ order_id, event });
    }
  }
  return positions;
}
