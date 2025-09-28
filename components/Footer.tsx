import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Better Maps</h3>
            <p className="text-gray-300">
              Optimize your routes with intelligent pathfinding and real-time distance calculations.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• Interactive Maps</li>
              <li>• Route Optimization</li>
              <li>• Distance Analysis</li>
              <li>• Google Maps Integration</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Technology</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• Next.js & TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• React Leaflet</li>
              <li>• OR-Tools TSP Solver</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Better Maps. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
