import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { DeliveryPosition } from '@/lib/delivery-positions';
import { useThemeMode } from '@/hooks/useThemeMode';
import { formatDisplayTime } from '@/lib/datetime';

const TILE_URLS = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
} as const;

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const DEFAULT_CENTER: L.LatLngExpression = [39.8283, -98.5795];
const DEFAULT_ZOOM = 4;

function deliveryIcon(): L.DivIcon {
  return L.divIcon({
    className: 'delivery-marker-icon',
    html: '<span class="delivery-marker-dot"></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

function FitBounds({ positions }: { positions: DeliveryPosition[] }) {
  const map = useMap();
  const didFit = useRef(false);

  useEffect(() => {
    if (didFit.current || positions.length === 0) return;
    didFit.current = true;
    const bounds = L.latLngBounds(
      positions.map((p) => [p.event.loc_lat, p.event.loc_lon] as L.LatLngTuple),
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [map, positions]);

  return null;
}

interface DeliveryMapProps {
  positions: DeliveryPosition[];
}

export function DeliveryMap({ positions }: DeliveryMapProps) {
  const themeMode = useThemeMode();
  const icon = useMemo(() => deliveryIcon(), []);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full min-h-[420px] rounded-lg z-0"
      scrollWheelZoom
    >
      <TileLayer
        key={themeMode}
        url={TILE_URLS[themeMode]}
        attribution={ATTRIBUTION}
      />
      <FitBounds positions={positions} />
      {positions.map(({ order_id, event }) => (
        <Marker
          key={order_id}
          position={[event.loc_lat, event.loc_lon]}
          icon={icon}
        >
          <Popup>
            <div className="delivery-popup text-sm space-y-1">
              <p className="font-medium">{order_id}</p>
              <p className="text-muted-foreground">{event.event_type}</p>
              <p>{formatDisplayTime(new Date(event.ts).getTime())}</p>
              {event.progress_pct != null && (
                <p>{event.progress_pct.toFixed(1)}% route progress</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
