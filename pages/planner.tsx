import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RouteForm from '../components/RouteForm';
import MapView from '../components/MapView';
import DistanceTable from '../components/DistanceTable';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface DistanceMatrix {
  matrix: number[][];
}

interface OptimizedRoute {
  order: number[];
  total_distance: number;
}

const PlannerPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [distanceMatrix, setDistanceMatrix] = useState<DistanceMatrix | null>(null);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationsUpdate = (newLocations: Location[]) => {
    setLocations(newLocations);
    setDistanceMatrix(null);
    setOptimizedRoute(null);
    setError(null);
  };

  const calculateDistanceMatrix = async () => {
    if (locations.length < 2) {
      setError('Please add at least 2 locations');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/distance-matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locations }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate distance matrix');
      }

      const data = await response.json();
      setDistanceMatrix(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeRoute = async () => {
    if (!distanceMatrix) {
      setError('Please calculate distance matrix first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/optimize-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distance_matrix: distanceMatrix.matrix,
          priority: [0], // Start from first location
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize route');
      }

      const data = await response.json();
      setOptimizedRoute(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToGoogleMaps = () => {
    if (!optimizedRoute || !locations.length) return;

    const orderedLocations = optimizedRoute.order.map(index => locations[index]);
    const waypoints = orderedLocations.slice(1, -1);
    const origin = orderedLocations[0];
    const destination = orderedLocations[orderedLocations.length - 1];

    let url = `https://www.google.com/maps/dir/`;
    url += `${origin.lat},${origin.lng}/`;
    
    if (waypoints.length > 0) {
      url += waypoints.map(wp => `${wp.lat},${wp.lng}`).join('/') + '/';
    }
    
    url += `${destination.lat},${destination.lng}`;

    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Planner</h1>
          <p className="text-gray-600">Plan and optimize your multi-stop routes</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form and Controls */}
          <div className="space-y-6">
            <RouteForm 
              locations={locations}
              onLocationsUpdate={handleLocationsUpdate}
            />

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Route Optimization</h3>
              
              <div className="space-y-4">
                <button
                  onClick={calculateDistanceMatrix}
                  disabled={isLoading || locations.length < 2}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition duration-300"
                >
                  {isLoading ? 'Calculating...' : 'Compute Distance Matrix'}
                </button>

                <button
                  onClick={optimizeRoute}
                  disabled={isLoading || !distanceMatrix}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition duration-300"
                >
                  {isLoading ? 'Optimizing...' : 'Compute Optimal Route'}
                </button>

                {optimizedRoute && (
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Route Optimized!</h4>
                    <p className="text-green-700 mb-3">
                      Total Distance: {(optimizedRoute.total_distance / 1000).toFixed(2)} km
                    </p>
                    <button
                      onClick={exportToGoogleMaps}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded transition duration-300"
                    >
                      Open in Google Maps
                    </button>
                  </div>
                )}
              </div>
            </div>

            {distanceMatrix && (
              <DistanceTable 
                locations={locations}
                distanceMatrix={distanceMatrix.matrix}
                optimizedRoute={optimizedRoute}
              />
            )}
          </div>

          {/* Right Column - Map */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Route Visualization</h3>
            <MapView 
              locations={locations}
              optimizedRoute={optimizedRoute}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PlannerPage;
