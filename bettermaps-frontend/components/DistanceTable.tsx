import React from 'react';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface DistanceTableProps {
  locations: Location[];
  distanceMatrix: number[][];
  optimizedRoute: { order: number[]; total_distance: number } | null;
}

const DistanceTable: React.FC<DistanceTableProps> = ({ 
  locations, 
  distanceMatrix, 
  optimizedRoute 
}) => {
  const formatDistance = (distance: number) => {
    return (distance / 1000).toFixed(2) + ' km';
  };

  const getLocationName = (index: number) => {
    return locations[index]?.name || `Location ${index + 1}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Distance Matrix</h3>
      
      {/* Distance Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                From \ To
              </th>
              {locations.map((_, index) => (
                <th 
                  key={index}
                  className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700"
                >
                  {getLocationName(index)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {distanceMatrix.map((row, fromIndex) => (
              <tr key={fromIndex}>
                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-700">
                  {getLocationName(fromIndex)}
                </td>
                {row.map((distance, toIndex) => (
                  <td 
                    key={toIndex}
                    className={`border border-gray-300 px-4 py-2 text-center ${
                      fromIndex === toIndex 
                        ? 'bg-gray-100 text-gray-500' 
                        : 'text-gray-900'
                    }`}
                  >
                    {fromIndex === toIndex ? '-' : formatDistance(distance)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Optimized Route Information */}
      {optimizedRoute && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-3">Optimized Route Order</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-green-700 font-medium">Total Distance:</span>
              <span className="text-green-800 font-bold">
                {formatDistance(optimizedRoute.total_distance)}
              </span>
            </div>
            
            <div className="mt-3">
              <span className="text-green-700 font-medium block mb-2">Route Sequence:</span>
              <div className="flex flex-wrap gap-2">
                {optimizedRoute.order.map((index, orderIndex) => (
                  <div
                    key={index}
                    className="flex items-center bg-white rounded px-3 py-1 text-sm"
                  >
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                      {orderIndex + 1}
                    </span>
                    <span className="text-gray-700">
                      {getLocationName(index)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Summary */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Route Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">Total Locations:</span>
            <span className="ml-2 text-blue-800">{locations.length}</span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Start Location:</span>
            <span className="ml-2 text-blue-800">{getLocationName(0)}</span>
          </div>
          {optimizedRoute && (
            <>
              <div>
                <span className="text-blue-700 font-medium">Optimized:</span>
                <span className="ml-2 text-green-600 font-medium">Yes</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Efficiency:</span>
                <span className="ml-2 text-green-600 font-medium">
                  {optimizedRoute.total_distance < distanceMatrix[0].reduce((a, b) => a + b, 0) 
                    ? 'Improved' 
                    : 'Optimal'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistanceTable;
