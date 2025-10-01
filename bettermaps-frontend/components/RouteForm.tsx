import React, { useMemo, useState } from 'react';

interface Location {
  lat: number;
  lng: number;
  name: string;
  priority?: boolean;
}

interface RouteFormProps {
  locations: Location[];
  onLocationsUpdate: (locations: Location[]) => void;
  onComputed: (args: {
    locations: Location[];
    distanceMatrix: number[][];
    optimizedRoute: { order: number[]; total_distance: number };
  }) => void;
}

const RouteForm: React.FC<RouteFormProps> = ({ locations, onLocationsUpdate, onComputed }) => {
  const [start, setStart] = useState<Location>({ lat: 40.7128, lng: -74.006, name: 'Start', priority: true });
  const [stops, setStops] = useState<Location[]>([
    { lat: 34.0522, lng: -118.2437, name: 'Stop 1', priority: false },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allLocations = useMemo(() => [start, ...stops], [start, stops]);

  const updateParentLocations = (updated: Location[]) => {
    onLocationsUpdate(updated);
  };

  const updateStart = (field: keyof Location, value: string | number | boolean) => {
    const updated = { ...start, [field]: value } as Location;
    setStart(updated);
    updateParentLocations([updated, ...stops]);
  };

  const updateStop = (index: number, field: keyof Location, value: string | number | boolean) => {
    const updatedStops = stops.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    setStops(updatedStops);
    updateParentLocations([start, ...updatedStops]);
  };

  const addStop = () => {
    const nextIndex = stops.length + 1;
    const next = [...stops, { lat: 0, lng: 0, name: `Stop ${nextIndex}`, priority: false }];
    setStops(next);
    updateParentLocations([start, ...next]);
  };

  const removeStop = (index: number) => {
    const next = stops.filter((_, i) => i !== index);
    setStops(next);
    updateParentLocations([start, ...next]);
  };

  const validate = (): string | null => {
    const names = allLocations.map(l => (l.name || '').trim());
    if (names.some(n => n.length === 0)) return 'All locations must have a name.';
    const coordsValid = allLocations.every(l => Number.isFinite(l.lat) && Number.isFinite(l.lng));
    if (!coordsValid) return 'All locations must have valid latitude and longitude.';
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) return 'Location names must be unique.';
    if (allLocations.length < 2) return 'Please add at least one stop.';
    return null;
  };

  const handleComputeRoute = async () => {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      // 1) Distance matrix
      const dmRes = await fetch('http://localhost:8000/distance-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations: allLocations.map(({ name, ...rest }) => rest) }),
      });
      if (!dmRes.ok) throw new Error('Failed to compute distance matrix');
      const dmData = await dmRes.json();

      // 2) Optimize
      const priorityIndices = allLocations
        .map((l, idx) => (l.priority ? idx : -1))
        .filter(idx => idx >= 0);
      const optRes = await fetch('http://localhost:8000/optimize-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distance_matrix: dmData.matrix, priority: priorityIndices }),
      });
      if (!optRes.ok) throw new Error('Failed to optimize route');
      const optData = await optRes.json();

      onComputed({ locations: allLocations, distanceMatrix: dmData.matrix, optimizedRoute: optData });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Route Locations</h3>
          <button
            type="button"
            onClick={() => {
              setStart({ lat: 40.7128, lng: -74.006, name: 'Start', priority: true });
              setStops([{ lat: 34.0522, lng: -118.2437, name: 'Stop 1', priority: false }]);
              updateParentLocations([
                { lat: 40.7128, lng: -74.006, name: 'Start', priority: true },
                { lat: 34.0522, lng: -118.2437, name: 'Stop 1', priority: false },
              ]);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-smooth"
          >
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="status-error mb-4">{error}</div>
      )}

      {/* Start */}
      <div className="space-y-3 mb-6">
        <h4 className="font-medium text-gray-700">Start Location</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={start.name}
            onChange={(e) => updateStart('name', e.target.value)}
            className="input-field md:col-span-2"
            placeholder="Name"
          />
          <input
            type="number"
            step="any"
            value={start.lat}
            onChange={(e) => updateStart('lat', parseFloat(e.target.value))}
            className="input-field"
            placeholder="Latitude"
          />
          <input
            type="number"
            step="any"
            value={start.lng}
            onChange={(e) => updateStart('lng', parseFloat(e.target.value))}
            className="input-field"
            placeholder="Longitude"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={!!start.priority}
              onChange={(e) => updateStart('priority', e.target.checked)}
            />
            Priority stop
          </label>
        </div>
      </div>

      {/* Stops */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-700">Stops</h4>
          <button type="button" onClick={addStop} className="btn-primary">Add Stop</button>
        </div>

        {stops.map((s, idx) => (
          <div key={idx} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Stop {idx + 1}</span>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={!!s.priority}
                    onChange={(e) => updateStop(idx, 'priority', e.target.checked)}
                  />
                  Priority
                </label>
                <button type="button" onClick={() => removeStop(idx)} className="btn-danger">Remove</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={s.name}
                onChange={(e) => updateStop(idx, 'name', e.target.value)}
                className="input-field md:col-span-2"
                placeholder="Name"
              />
              <input
                type="number"
                step="any"
                value={s.lat}
                onChange={(e) => updateStop(idx, 'lat', parseFloat(e.target.value))}
                className="input-field"
                placeholder="Latitude"
              />
              <input
                type="number"
                step="any"
                value={s.lng}
                onChange={(e) => updateStop(idx, 'lng', parseFloat(e.target.value))}
                className="input-field"
                placeholder="Longitude"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleComputeRoute}
          disabled={isLoading}
          className="btn-success disabled:bg-gray-400"
        >
          {isLoading ? 'Computing…' : 'Compute Route'}
        </button>
      </div>
    </div>
  );
};

export default RouteForm;


