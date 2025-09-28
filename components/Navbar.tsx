import React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Better Maps
          </Link>
          
          <div className="space-x-6">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 transition duration-300"
            >
              Home
            </Link>
            <Link 
              href="/planner" 
              className="text-gray-700 hover:text-blue-600 transition duration-300"
            >
              Route Planner
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
