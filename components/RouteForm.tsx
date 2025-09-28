import React, { useState } from 'react';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface RouteFormProps {
  locations: Location[];
  onLocationsUpdate: (locations: Location[]) => void;
}

const RouteForm: React.FC<RouteFormProps> = ({ locations, onLocationsUpdate }) => {
  const [startLocation, setStartLocation] = useState<Location>({
    lat: 40.7128,
    lng: -74.0060,
    name: 'New York, NY'
  });
  const [stops, setStops] = useState<Location[]>([
    { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
    { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' }
  ]);

  const updateStartLocation = (field: keyof Location, value: string | number) => {
    const updated = { ...startLocation, [field]: value };
    setStartLocation(updated);
    updateAllLocations(updated, stops);
  };

  const updateStop = (index: number, field: keyof Location, value: string | number) => {
    const updated = stops.map((stop, i) => 
      i === index ? { ...stop, [field]: value } : stop
    );
    setStops(updated);
    updateAllLocations(startLocation, updated);
  };

  const addStop = () => {
    const newStop: Location = {
      lat: 0,
      lng: 0,
      name: `Stop ${stops.length + 1}`
    };
    const updated = [...stops, newStop];
    setStops(updated);
    updateAllLocations(startLocation, updated);
  };

  const removeStop = (index: number) => {
    const updated = stops.filter((_, i) => i !== index);
    setStops(updated);
    updateAllLocations(startLocation, updated);
  };

  const updateAllLocations = (start: Location, stopList: Location[]) => {
    const allLocations = [start, ...stopList];
    onLocationsUpdate(allLocations);
  };

  const clearAll = () => {
    setStartLocation({ lat: 40.7128, lng: -74.0060, name: 'New York, NY' });
    setStops([
      { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
      { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' }
    ]);
    onLocationsUpdate([
      { lat: 40.7128, lng: -74.0060, name: 'New York, NY' },
      { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
      { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' }
    ]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Route Locations</h3>
        <button
          onClick={clearAll}
          className="text-sm text-gray-500 hover:text-gray-700 transition duration-300"
        >
          Reset to Default
        </button>
      </div>

      <div className="space-y-6">
        {/* Start Location */}
        <div className="border-b pb-4">
          <h4 className="font-medium text-gray-700 mb-3">Start Location</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Name
              </label>
              <input
                type="text"
                value={startLocation.name}
                onChange={(e) => updateStartLocation('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Location name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={startLocation.lat}
                onChange={(e) => updateStartLocation('lat', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={startLocation.lng}
                onChange={(e) => updateStartLocation('lng', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.0000"
              />
            </div>
          </div>
        </div>

        {/* Stops */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-700">Stops</h4>
            <button
              onClick={addStop}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded transition duration-300"
            >
              Add Stop
            </button>
          </div>
          
          <div className="space-y-4">
            {stops.map((stop, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    Stop {index + 1}
                  </span>
                  <button
                    onClick={() => removeStop(index)}
                    className="text-red-500 hover:text-red-700 text-sm transition duration-300"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={stop.name}
                      onChange={(e) => updateStop(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Stop name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={stop.lat}
                      onChange={(e) => updateStop(index, 'lat', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={stop.lng}
                      onChange={(e) => updateStop(index, 'lng', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.0000"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteForm;
