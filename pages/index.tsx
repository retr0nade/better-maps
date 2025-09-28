import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Better Maps
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Optimize your multi-stop routes with intelligent pathfinding and real-time distance calculations.
          </p>
          <Link 
            href="/planner"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
          >
            Start Planning Routes
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-blue-600 text-3xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold mb-3">Interactive Maps</h3>
            <p className="text-gray-600">
              Visualize your routes with Leaflet.js integration for seamless map interaction.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-blue-600 text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3">Smart Optimization</h3>
            <p className="text-gray-600">
              OR-Tools TSP solver finds the most efficient route through all your stops.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-blue-600 text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Real-time Analysis</h3>
            <p className="text-gray-600">
              Get accurate distance calculations using OSRM routing service.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold mb-2">Add Locations</h4>
              <p className="text-sm text-gray-600">Enter your start point and multiple stops</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-semibold mb-2">Calculate Distances</h4>
              <p className="text-sm text-gray-600">Get real-time distance matrix between all points</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-semibold mb-2">Optimize Route</h4>
              <p className="text-sm text-gray-600">AI finds the most efficient visiting order</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h4 className="font-semibold mb-2">Export & Navigate</h4>
              <p className="text-sm text-gray-600">Send to Google Maps for turn-by-turn directions</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
