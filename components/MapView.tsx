import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  )
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
  if (locations.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Add locations to see them on the map</p>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden">
      <MapComponent locations={locations} optimizedRoute={optimizedRoute} />
    </div>
  );
};

export default MapView;
