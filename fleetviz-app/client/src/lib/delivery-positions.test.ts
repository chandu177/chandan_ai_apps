import { describe, expect, it } from 'vitest';
import type { DeliveryEvent } from '@shared/types/delivery-event';
import { buildTracks, getPositionsAtTime, lastEventAtOrBefore } from './delivery-positions';

function event(
  order_id: string,
  ts: string,
  lat: number,
  lon: number,
): DeliveryEvent {
  return {
    sequence: 1,
    order_id,
    location_id: 1,
    event_id: `${order_id}-${ts}`,
    event_type: 'ping',
    ts,
    loc_lat: lat,
    loc_lon: lon,
    progress_pct: null,
  };
}

describe('delivery-positions', () => {
  it('returns last event at or before timestamp per order', () => {
    const events = [
      event('A', '2024-01-01T10:00:00Z', 1, 1),
      event('A', '2024-01-01T12:00:00Z', 2, 2),
      event('B', '2024-01-01T11:00:00Z', 3, 3),
    ];
    const tracks = buildTracks(events);
    const at = new Date('2024-01-01T11:30:00Z').getTime();
    const positions = getPositionsAtTime(tracks, at);
    expect(positions).toHaveLength(2);
    expect(positions.find((p) => p.order_id === 'A')?.event.loc_lat).toBe(1);
    expect(positions.find((p) => p.order_id === 'B')?.event.loc_lat).toBe(3);
  });

  it('excludes orders with no events before timestamp', () => {
    const track = [event('A', '2024-01-01T12:00:00Z', 1, 1)];
    expect(lastEventAtOrBefore(track, new Date('2024-01-01T10:00:00Z').getTime())).toBeNull();
  });
});
