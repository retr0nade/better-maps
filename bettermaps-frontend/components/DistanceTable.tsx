import React, { useMemo } from 'react';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface DistanceTableProps {
  locations: Location[];
  distanceMatrix: number[][]; // meters
  optimizedRoute: { order: number[]; total_distance: number } | null;
}

const DistanceTable: React.FC<DistanceTableProps> = ({ locations, distanceMatrix, optimizedRoute }) => {
  const rows = useMemo(() => {
    // distance from start (index 0) to each stop
    const startIndex = 0;
    return locations.map((loc, idx) => {
      const distance = idx === startIndex ? 0 : (distanceMatrix?.[startIndex]?.[idx] ?? 0);
      const order = optimizedRoute ? optimizedRoute.order.indexOf(idx) + 1 : null;
      return { idx, name: loc.name || `Stop ${idx}`, distance, order };
    });
  }, [locations, distanceMatrix, optimizedRoute]);

  const formatKm = (m: number) => `${(m / 1000).toFixed(2)} km`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Distance Overview</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b text-gray-700">Stop</th>
              <th className="px-4 py-3 border-b text-gray-700">Distance from Start</th>
              <th className="px-4 py-3 border-b text-gray-700">Optimized Order</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.idx} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 border-b">
                  {row.idx === 0 ? (
                    <span className="font-medium text-gray-900">Start — {row.name}</span>
                  ) : (
                    <span className="text-gray-800">{row.name}</span>
                  )}
                </td>
                <td className="px-4 py-3 border-b">
                  {row.idx === 0 ? '-' : <span className="text-gray-900">{formatKm(row.distance)}</span>}
                </td>
                <td className="px-4 py-3 border-b">
                  {optimizedRoute && row.order ? (
                    <span className={`inline-flex items-center justify-center rounded-full w-7 h-7 text-sm font-semibold ${row.order === 1 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {row.order}
                    </span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {optimizedRoute && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-semibold">Total Optimized Distance</span>
            <span className="text-green-900 font-bold">{formatKm(optimizedRoute.total_distance)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistanceTable;


