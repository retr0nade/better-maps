'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface DistanceMatrixResponse {
  matrix: number[][];
}

interface OptimizedRouteResponse {
  order: number[];
  total_distance: number;
}

export default function PlanRoutePage() {
  const [startLocation, setStartLocation] = useState<Location>({
    id: 'start',
    name: '',
    lat: 40.7128,
    lng: -74.0060
  });
  
  const [stops, setStops] = useState<Location[]>([]);
  const [distanceMatrix, setDistanceMatrix] = useState<number[][]>([]);
  const [optimizedOrder, setOptimizedOrder] = useState<number[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const addStop = () => {
    const newStop: Location = {
      id: `stop-${Date.now()}`,
      name: '',
      lat: 40.7128,
      lng: -74.0060
    };
    setStops([...stops, newStop]);
  };

  const removeStop = (id: string) => {
    setStops(stops.filter(stop => stop.id !== id));
  };

  const updateLocation = (id: string, field: keyof Location, value: string | number) => {
    if (id === 'start') {
      setStartLocation(prev => ({ ...prev, [field]: value }));
    } else {
      setStops(prev => prev.map(stop => 
        stop.id === id ? { ...stop, [field]: value } : stop
      ));
    }
  };

  const getAllLocations = (): Location[] => {
    return [startLocation, ...stops];
  };

  const computeDistanceMatrix = async () => {
    const locations = getAllLocations();
    if (locations.length < 2) {
      setError('Please add at least one stop');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/distance-matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locations: locations.map(loc => ({ lat: loc.lat, lng: loc.lng }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DistanceMatrixResponse = await response.json();
      setDistanceMatrix(data.matrix);
    } catch (err) {
      setError(`Failed to compute distance matrix: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const optimizeRoute = async () => {
    if (distanceMatrix.length === 0) {
      setError('Please compute distance matrix first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/optimize-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distance_matrix: distanceMatrix,
          priority: [0] // Start location is always first
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OptimizedRouteResponse = await response.json();
      setOptimizedOrder(data.order);
      setTotalDistance(data.total_distance);
    } catch (err) {
      setError(`Failed to optimize route: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getDistanceFromStart = (stopIndex: number): number => {
    if (distanceMatrix.length === 0 || stopIndex >= distanceMatrix[0].length) {
      return 0;
    }
    return distanceMatrix[0][stopIndex + 1]; // +1 because start is at index 0
  };

  const generateGoogleMapsUrl = (): string => {
    if (optimizedOrder.length === 0) {
      return '';
    }

    const locations = getAllLocations();
    const orderedLocations = optimizedOrder.map(index => 
      index === 0 ? startLocation : stops[index - 1]
    );

    // Start location (origin)
    const origin = `${orderedLocations[0].lat},${orderedLocations[0].lng}`;
    
    // Last location (destination)
    const destination = `${orderedLocations[orderedLocations.length - 1].lat},${orderedLocations[orderedLocations.length - 1].lng}`;
    
    // Waypoints (all locations except first and last)
    const waypoints = orderedLocations.slice(1, -1)
      .map(loc => `${loc.lat},${loc.lng}`)
      .join('|');

    const baseUrl = 'https://www.google.com/maps/dir/?api=1';
    const params = new URLSearchParams({
      origin,
      destination,
      ...(waypoints && { waypoints })
    });

    return `${baseUrl}&${params.toString()}`;
  };

  const openInGoogleMaps = () => {
    const url = generateGoogleMapsUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Route Planner</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            {/* Start Location */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Start Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={startLocation.name}
                    onChange={(e) => updateLocation('start', 'name', e.target.value)}
                    placeholder="e.g., Home, Office"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={startLocation.lat}
                      onChange={(e) => updateLocation('start', 'lat', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={startLocation.lng}
                      onChange={(e) => updateLocation('start', 'lng', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stops */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Stops</h2>
                <button
                  onClick={addStop}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Stop
                </button>
              </div>
              
              <div className="space-y-4">
                {stops.map((stop, index) => (
                  <div key={stop.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Stop {index + 1}</h3>
                      <button
                        onClick={() => removeStop(stop.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={stop.name}
                          onChange={(e) => updateLocation(stop.id, 'name', e.target.value)}
                          placeholder="e.g., Store, Restaurant"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={stop.lat}
                            onChange={(e) => updateLocation(stop.id, 'lat', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={stop.lng}
                            onChange={(e) => updateLocation(stop.id, 'lng', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-4">
                <button
                  onClick={computeDistanceMatrix}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Computing...' : 'Compute Distance Matrix'}
                </button>
                
                <button
                  onClick={optimizeRoute}
                  disabled={loading || distanceMatrix.length === 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Optimizing...' : 'Compute Route'}
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Map and Results */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Map</h2>
              <div className="h-96 rounded-md overflow-hidden">
                <MapContainer
                  center={[startLocation.lat, startLocation.lng]}
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Start location marker */}
                  <Marker position={[startLocation.lat, startLocation.lng]}>
                    <Popup>
                      <div>
                        <strong>Start: {startLocation.name || 'Start Location'}</strong>
                        <br />
                        {startLocation.lat.toFixed(6)}, {startLocation.lng.toFixed(6)}
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Stop markers */}
                  {stops.map((stop, index) => (
                    <Marker key={stop.id} position={[stop.lat, stop.lng]}>
                      <Popup>
                        <div>
                          <strong>Stop {index + 1}: {stop.name || `Stop ${index + 1}`}</strong>
                          <br />
                          {stop.lat.toFixed(6)}, {stop.lng.toFixed(6)}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Distance Table */}
            {distanceMatrix.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Distances from Start</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stop
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Distance (m)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Distance (km)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stops.map((stop, index) => (
                        <tr key={stop.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {stop.name || `Stop ${index + 1}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getDistanceFromStart(index).toFixed(0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(getDistanceFromStart(index) / 1000).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Optimized Route */}
            {optimizedOrder.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Optimized Route</h2>
                  <button
                    onClick={openInGoogleMaps}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Open in Google Maps</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Total Distance: {(totalDistance / 1000).toFixed(2)} km
                  </p>
                  <div className="space-y-1">
                    {optimizedOrder.map((index, orderIndex) => {
                      const location = index === 0 ? startLocation : stops[index - 1];
                      const name = location.name || (index === 0 ? 'Start' : `Stop ${index}`);
                      return (
                        <div key={orderIndex} className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                            {orderIndex + 1}
                          </span>
                          <span className="text-sm">
                            {name} ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
