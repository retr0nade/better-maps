import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

interface MapComponentProps {
  locations: Location[];
  optimizedRoute: OptimizedRoute | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ locations, optimizedRoute }) => {
  const mapRef = useRef<L.Map>(null);

  // Calculate center point
  const center: [number, number] = locations.length > 0 
    ? [locations[0].lat, locations[0].lng]
    : [40.7128, -74.0060];

  // Get ordered locations if route is optimized
  const orderedLocations = optimizedRoute 
    ? optimizedRoute.order.map(index => locations[index])
    : locations;

  // Create polyline coordinates
  const polylinePositions: [number, number][] = orderedLocations.map(loc => [loc.lat, loc.lng]);

  // Custom icons
  const startIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const stopIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const endIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const getIcon = (index: number, total: number) => {
    if (index === 0) return startIcon;
    if (index === total - 1) return endIcon;
    return stopIcon;
  };

  const getMarkerLabel = (index: number, total: number) => {
    if (index === 0) return 'Start';
    if (index === total - 1) return 'End';
    return `Stop ${index}`;
  };

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Markers */}
      {orderedLocations.map((location, index) => (
        <Marker
          key={`${location.lat}-${location.lng}-${index}`}
          position={[location.lat, location.lng]}
          icon={getIcon(index, orderedLocations.length)}
        >
          <Popup>
            <div>
              <strong>{getMarkerLabel(index, orderedLocations.length)}</strong>
              <br />
              {location.name}
              <br />
              <small>
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </small>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Route line */}
      {polylinePositions.length > 1 && (
        <Polyline
          positions={polylinePositions}
          color={optimizedRoute ? '#10b981' : '#6b7280'}
          weight={4}
          opacity={0.8}
        />
      )}
    </MapContainer>
  );
};

export default MapComponent;
