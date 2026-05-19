import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@databricks/appkit-ui/react';
import { useEffect, useState } from 'react';
import type { DeliveryEvent, MapEventsResponse } from '@shared/types/delivery-event';
import { DeliveryMap } from '@/components/map/DeliveryMap';
import { MapTimeline } from '@/components/map/MapTimeline';
import { useDeliveryPositionsAtTime } from '@/hooks/useDeliveryPositionsAtTime';
import { parseEventTime } from '@/lib/datetime';

export function DeliveryMapDashboard() {
  const [events, setEvents] = useState<DeliveryEvent[]>([]);
  const [timeRange, setTimeRange] = useState<{ minMs: number; maxMs: number } | null>(null);
  const [selectedMs, setSelectedMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/map/events')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch map events: ${res.statusText}`);
        return res.json() as Promise<MapEventsResponse>;
      })
      .then((data) => {
        setEvents(data.events);
        if (data.timeRange) {
          const minMs = parseEventTime(data.timeRange.min);
          const maxMs = parseEventTime(data.timeRange.max);
          setTimeRange({ minMs, maxMs });
          setSelectedMs(maxMs);
        } else {
          setTimeRange(null);
          setSelectedMs(null);
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load delivery data'),
      )
      .finally(() => setLoading(false));
  }, []);

  const positions = useDeliveryPositionsAtTime(events, selectedMs);

  return (
    <div className="flex flex-col gap-4 h-full w-full max-w-6xl mx-auto">
      <div className="shrink-0">
        <h2 className="text-xl font-semibold text-foreground">Delivery map</h2>
        <p className="text-sm text-muted-foreground">
          Delivery positions at a point in time. Scrub the timeline to replay movement.
        </p>
      </div>

      {error && (
        <div className="text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
      )}

      <Card className="shadow-lg flex-1 flex flex-col min-h-0 overflow-hidden">
        <CardHeader className="shrink-0 pb-2">
          <CardTitle className="text-base">Live positions</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-[420px] p-0 sm:p-0 overflow-hidden relative">
          {loading && (
            <Skeleton className="absolute inset-4 rounded-lg" />
          )}
          {!loading && events.length === 0 && !error && (
            <p className="text-muted-foreground text-center py-16 px-4">
              No location events found. Sync GPS delivery events to Lakebase to see the map.
            </p>
          )}
          {!loading && events.length > 0 && selectedMs != null && (
            <DeliveryMap positions={positions} />
          )}
        </CardContent>
      </Card>

      {timeRange && selectedMs != null && !loading && (
        <Card className="shadow-lg shrink-0">
          <CardContent className="pt-6">
            <MapTimeline
              minMs={timeRange.minMs}
              maxMs={timeRange.maxMs}
              selectedMs={selectedMs}
              deliveryCount={positions.length}
              onChange={setSelectedMs}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
