import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configure default marker icons (fixes missing icons when using Leaflet with bundlers)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface OptimizedRoute {
  order: number[];
  total_distance: number;
}

interface MapViewImplProps {
  locations: Location[];
  optimizedRoute: OptimizedRoute | null;
}

const MapViewImpl: React.FC<MapViewImplProps> = ({ locations, optimizedRoute }) => {
  const center: [number, number] = useMemo(() => {
    if (locations.length > 0) return [locations[0].lat, locations[0].lng];
    return [40.7128, -74.0060];
  }, [locations]);

  const orderedLocations = useMemo(() => {
    if (optimizedRoute && optimizedRoute.order?.length) {
      return optimizedRoute.order.map(i => locations[i]).filter(Boolean);
    }
    return locations;
  }, [locations, optimizedRoute]);

  const polyline: [number, number][] = useMemo(
    () => orderedLocations.map(l => [l.lat, l.lng]),
    [orderedLocations]
  );

  return (
    <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((loc, idx) => (
        <Marker key={`${loc.lat}-${loc.lng}-${idx}`} position={[loc.lat, loc.lng]}>
          <Popup>
            <div>
              <strong>{loc.name || `Stop ${idx}`}</strong>
              <br />
              {optimizedRoute ? `Order: ${optimizedRoute.order.indexOf(idx) + 1}` : `Index: ${idx + 1}`}
              <br />
              <small>{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</small>
            </div>
          </Popup>
        </Marker>
      ))}

      {polyline.length > 1 && (
        <Polyline positions={polyline} color={optimizedRoute ? '#10b981' : '#2563eb'} weight={4} opacity={0.85} />
      )}
    </MapContainer>
  );
};

export default MapViewImpl;


