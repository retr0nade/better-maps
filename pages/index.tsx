import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedHero from '../components/AnimatedHero';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-10 md:py-16">
        <AnimatedHero />

        {/* Condensed Features */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          <div className="overlay-panel">
            <h3 className="text-lg font-semibold mb-2">Distance Overview</h3>
            <p className="text-gray-600 text-sm">Quickly inspect distances and ETAs between multiple stops.</p>
          </div>
          <div className="overlay-panel">
            <h3 className="text-lg font-semibold mb-2">TSP Optimization</h3>
            <p className="text-gray-600 text-sm">Solve multi-stop routes efficiently using OR-Tools.</p>
          </div>
          <div className="overlay-panel">
            <h3 className="text-lg font-semibold mb-2">Priority Stops</h3>
            <p className="text-gray-600 text-sm">Reorder critical locations and respect constraints.</p>
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

        {/* Feedback CTA */}
        <div className="text-center mt-12">
          <Link href="/feedback" className="btn-primary" aria-label="Leave feedback for BetterMaps">
            Leave feedback
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
