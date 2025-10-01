import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the heavy Leaflet map implementation to avoid SSR issues
const MapComponent = dynamic(() => import('./MapViewImpl'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map…</p>
    </div>
  ),
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

interface MapViewProps {
  locations: Location[];
  optimizedRoute: OptimizedRoute | null;
}

const MapView: React.FC<MapViewProps> = ({ locations, optimizedRoute }) => {
  return (
    <div className="w-full h-full min-h-80">
      <MapComponent locations={locations} optimizedRoute={optimizedRoute} />
    </div>
  );
};

export default MapView;


