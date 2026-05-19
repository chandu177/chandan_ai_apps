import { z } from 'zod';
import type { Application } from 'express';
import type { DeliveryEvent, MapEventsResponse } from '../../../shared/types/delivery-event.js';

interface AppKitWithLakebase {
  lakebase: {
    query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

/** Synced delivery events table in fleetviz Lakebase. */
const ALL_EVENTS_TABLE = 'public.all_events_lakebase';

const MapEventsQuery = z.object({
  limit: z.coerce.number().int().min(1).max(10000).default(5000),
});

const GPS_EVENTS_SQL = `
  SELECT
    sequence,
    order_id,
    location_id,
    event_id,
    event_type,
    ts,
    (body::jsonb->>'loc_lat')::double precision AS loc_lat,
    (body::jsonb->>'loc_lon')::double precision AS loc_lon,
    (body::jsonb->>'progress_pct')::double precision AS progress_pct
  FROM ${ALL_EVENTS_TABLE}
  WHERE body::jsonb ? 'loc_lat'
    AND body::jsonb ? 'loc_lon'
`;

function mapRow(row: Record<string, unknown>): DeliveryEvent {
  return {
    sequence: Number(row.sequence),
    order_id: String(row.order_id),
    location_id: Number(row.location_id),
    event_id: String(row.event_id),
    event_type: String(row.event_type),
    ts: String(row.ts),
    loc_lat: Number(row.loc_lat),
    loc_lon: Number(row.loc_lon),
    progress_pct: row.progress_pct != null ? Number(row.progress_pct) : null,
  };
}

export function setupEventsRoutes(appkit: AppKitWithLakebase) {
  appkit.server.extend((app) => {
    app.get('/api/map/events', async (req, res) => {
      try {
        const parsed = MapEventsQuery.safeParse(req.query);
        if (!parsed.success) {
          res.status(400).json({ error: 'Invalid query parameters' });
          return;
        }

        const { limit } = parsed.data;

        const result = await appkit.lakebase.query(
          `${GPS_EVENTS_SQL}
          ORDER BY ts ASC
          LIMIT $1`,
          [limit],
        );

        const events = result.rows.map(mapRow);
        const body: MapEventsResponse = {
          events,
          table: ALL_EVENTS_TABLE,
          timeRange:
            events.length > 0
              ? { min: events[0].ts, max: events[events.length - 1].ts }
              : null,
        };

        res.json(body);
      } catch (err) {
        console.error('Failed to list map events:', err);
        res.status(500).json({ error: 'Failed to list map events' });
      }
    });
  });
}
