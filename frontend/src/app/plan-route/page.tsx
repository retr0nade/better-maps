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

interface SavedRoute {
  id: string;
  name: string;
  startLocation: Location;
  stops: Location[];
  distanceMatrix: number[][];
  optimizedOrder: number[];
  totalDistance: number;
  savedAt: string;
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
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [routeName, setRouteName] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isComputingMatrix, setIsComputingMatrix] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Load saved routes from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedRoutes');
    if (saved) {
      try {
        setSavedRoutes(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved routes:', error);
      }
    }
  }, []);

  // Save routes to localStorage whenever savedRoutes changes
  useEffect(() => {
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
  }, [savedRoutes]);

  const addStop = () => {
    if (stops.length >= 15) {
      setError('Maximum 15 stops allowed for MVP');
      return;
    }
    
    const newStop: Location = {
      id: `stop-${Date.now()}`,
      name: '',
      lat: 40.7128,
      lng: -74.0060
    };
    setStops([...stops, newStop]);
    setError('');
  };

  const removeStop = (id: string) => {
    setStops(stops.filter(stop => stop.id !== id));
  };

  const validateCoordinate = (value: number, field: string): boolean => {
    if (field === 'lat') {
      return value >= -90 && value <= 90;
    } else if (field === 'lng') {
      return value >= -180 && value <= 180;
    }
    return true;
  };

  const updateLocation = (id: string, field: keyof Location, value: string | number) => {
    // Validate coordinates
    if ((field === 'lat' || field === 'lng') && typeof value === 'number') {
      if (!validateCoordinate(value, field)) {
        setError(`Invalid ${field === 'lat' ? 'latitude' : 'longitude'}. Must be between ${field === 'lat' ? '-90 and 90' : '-180 and 180'}`);
        return;
      }
    }

    if (id === 'start') {
      setStartLocation(prev => ({ ...prev, [field]: value }));
    } else {
      setStops(prev => prev.map(stop => 
        stop.id === id ? { ...stop, [field]: value } : stop
      ));
    }
    setError('');
  };

  const getAllLocations = (): Location[] => {
    return [startLocation, ...stops];
  };

  const computeDistanceMatrix = async () => {
    const locations = getAllLocations();
    
    // Validation
    if (locations.length < 2) {
      setError('Please add at least one stop');
      return;
    }

    // Validate all coordinates
    for (const loc of locations) {
      if (!validateCoordinate(loc.lat, 'lat') || !validateCoordinate(loc.lng, 'lng')) {
        setError('Please fix invalid coordinates before computing distances');
        return;
      }
    }

    setIsComputingMatrix(true);
    setError('');
    setSuccessMessage('');

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: DistanceMatrixResponse = await response.json();
      setDistanceMatrix(data.matrix);
      setSuccessMessage('Distance matrix computed successfully!');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('OSRM')) {
          setError('OSRM service unavailable. Please check your internet connection and try again.');
        } else if (err.message.includes('timeout')) {
          setError('Request timed out. Please try again with fewer locations.');
        } else {
          setError(`Failed to compute distance matrix: ${err.message}`);
        }
      } else {
        setError('Failed to compute distance matrix: Unknown error');
      }
    } finally {
      setIsComputingMatrix(false);
    }
  };

  const optimizeRoute = async () => {
    if (distanceMatrix.length === 0) {
      setError('Please compute distance matrix first');
      return;
    }

    setIsOptimizing(true);
    setError('');
    setSuccessMessage('');

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: OptimizedRouteResponse = await response.json();
      setOptimizedOrder(data.order);
      setTotalDistance(data.total_distance);
      setSuccessMessage('Route optimized successfully!');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('TSP') || err.message.includes('optimization')) {
          setError('Route optimization failed. Please try again or reduce the number of stops.');
        } else {
          setError(`Failed to optimize route: ${err.message}`);
        }
      } else {
        setError('Failed to optimize route: Unknown error');
      }
    } finally {
      setIsOptimizing(false);
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

  const saveRoute = () => {
    if (!routeName.trim()) {
      setError('Please enter a route name');
      return;
    }

    if (optimizedOrder.length === 0) {
      setError('Please optimize the route first');
      return;
    }

    const newRoute: SavedRoute = {
      id: `route-${Date.now()}`,
      name: routeName.trim(),
      startLocation: { ...startLocation },
      stops: [...stops],
      distanceMatrix: [...distanceMatrix],
      optimizedOrder: [...optimizedOrder],
      totalDistance,
      savedAt: new Date().toISOString()
    };

    setSavedRoutes(prev => [newRoute, ...prev]);
    setRouteName('');
    setShowSaveDialog(false);
    setError('');
  };

  const loadRoute = (route: SavedRoute) => {
    setStartLocation({ ...route.startLocation });
    setStops([...route.stops]);
    setDistanceMatrix([...route.distanceMatrix]);
    setOptimizedOrder([...route.optimizedOrder]);
    setTotalDistance(route.totalDistance);
    setError('');
  };

  const deleteRoute = (routeId: string) => {
    setSavedRoutes(prev => prev.filter(route => route.id !== routeId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Route Planner</h1>
          
          {/* Saved Routes Dropdown */}
          <div className="flex items-center space-x-4">
            {savedRoutes.length > 0 && (
              <div className="relative">
                <select
                  onChange={(e) => {
                    const route = savedRoutes.find(r => r.id === e.target.value);
                    if (route) loadRoute(route);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  defaultValue=""
                >
                  <option value="">Load saved route...</option>
                  {savedRoutes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.name} ({new Date(route.savedAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {optimizedOrder.length > 0 && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Save Route</span>
              </button>
            )}
          </div>
        </div>
        
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
                  disabled={stops.length >= 15}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Stop ({stops.length}/15)</span>
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
                  disabled={isComputingMatrix || isOptimizing}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isComputingMatrix ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Computing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Compute Distance Matrix</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={optimizeRoute}
                  disabled={isOptimizing || isComputingMatrix || distanceMatrix.length === 0}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isOptimizing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Compute Route</span>
                    </>
                  )}
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {successMessage && (
                <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                  </div>
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
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Distances from Start</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Stop
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Distance (m)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Distance (km)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {stops.map((stop, index) => (
                        <tr key={stop.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center justify-center font-semibold">
                                {index + 1}
                              </span>
                              <span>{stop.name || `Stop ${index + 1}`}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                            {getDistanceFromStart(index).toFixed(0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
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
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Optimized Route</h2>
                  <button
                    onClick={openInGoogleMaps}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Open in Google Maps</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">
                      Total Distance: <span className="font-mono text-lg font-bold text-blue-600">{(totalDistance / 1000).toFixed(2)} km</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    {optimizedOrder.map((index, orderIndex) => {
                      const location = index === 0 ? startLocation : stops[index - 1];
                      const name = location.name || (index === 0 ? 'Start' : `Stop ${index}`);
                      return (
                        <div key={orderIndex} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                          <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm rounded-full flex items-center justify-center font-bold shadow-sm">
                            {orderIndex + 1}
                          </span>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">{name}</span>
                            <p className="text-xs text-gray-500 font-mono">
                              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Save Route Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Save Route</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Route Name
                  </label>
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="e.g., Daily Delivery Route"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowSaveDialog(false);
                      setRouteName('');
                      setError('');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveRoute}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Saved Routes List */}
        {savedRoutes.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Saved Routes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRoutes.map(route => (
                <div key={route.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{route.name}</h3>
                    <button
                      onClick={() => deleteRoute(route.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {route.stops.length + 1} locations • {(route.totalDistance / 1000).toFixed(2)} km
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Saved: {new Date(route.savedAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => loadRoute(route)}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Load Route
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
