import { Slider } from '@databricks/appkit-ui/react';
import { formatDisplayTime, fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/datetime';

interface MapTimelineProps {
  minMs: number;
  maxMs: number;
  selectedMs: number;
  deliveryCount: number;
  onChange: (ms: number) => void;
}

export function MapTimeline({
  minMs,
  maxMs,
  selectedMs,
  deliveryCount,
  onChange,
}: MapTimelineProps) {
  const span = maxMs - minMs;
  const sliderValue = span > 0 ? Math.round(((selectedMs - minMs) / span) * 1000) : 0;

  const handleSlider = (value: number[]) => {
    const ratio = value[0] / 1000;
    onChange(minMs + ratio * span);
  };

  const handleDatetime = (value: string) => {
    if (!value) return;
    const ms = fromDatetimeLocalValue(value);
    onChange(Math.min(maxMs, Math.max(minMs, ms)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Timeline</p>
          <p className="text-sm text-muted-foreground">{formatDisplayTime(selectedMs)}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {deliveryCount} {deliveryCount === 1 ? 'delivery' : 'deliveries'} on map
        </p>
      </div>

      <Slider
        value={[sliderValue]}
        min={0}
        max={1000}
        step={1}
        disabled={span <= 0}
        onValueChange={handleSlider}
        aria-label="Delivery time scrubber"
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted-foreground" htmlFor="map-datetime">
          Date & time
        </label>
        <input
          id="map-datetime"
          type="datetime-local"
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={toDatetimeLocalValue(selectedMs)}
          min={toDatetimeLocalValue(minMs)}
          max={toDatetimeLocalValue(maxMs)}
          onChange={(e) => handleDatetime(e.target.value)}
        />
      </div>
    </div>
  );
}
