import { useMemo } from 'react';
import type { DeliveryEvent } from '@shared/types/delivery-event';
import {
  buildTracks,
  getPositionsAtTime,
  type DeliveryPosition,
} from '@/lib/delivery-positions';

export function useDeliveryPositionsAtTime(
  events: DeliveryEvent[],
  selectedTimeMs: number | null,
): DeliveryPosition[] {
  const tracks = useMemo(() => buildTracks(events), [events]);

  return useMemo(() => {
    if (selectedTimeMs == null) return [];
    return getPositionsAtTime(tracks, selectedTimeMs);
  }, [tracks, selectedTimeMs]);
}
