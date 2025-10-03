import React from 'react';
import Link from 'next/link';
import AnimatedHero from '../components/AnimatedHero';
import { ChartBarIcon, CpuChipIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface HomePageProps {
  darkMode?: boolean
}

const HomePage: React.FC<HomePageProps> = ({ darkMode = false }) => {
  return (
    <main className="container mx-auto px-4 py-10 md:py-16">
      <AnimatedHero darkMode={darkMode} />

      {/* Condensed Features */}
      <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
        <div className={`rounded-xl shadow-sm p-6 transform hover:scale-105 transition duration-300 ${
          darkMode 
            ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 hover:shadow-lg'
            : 'bg-white border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-md'
        }`}>
          <ChartBarIcon className="w-6 h-6 text-indigo-500 mb-3" />
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>Distance Overview</h3>
          <p className={`text-sm leading-relaxed ${
            darkMode ? 'text-gray-200' : 'text-gray-600'
          }`}>Quickly inspect distances and ETAs between multiple stops.</p>
        </div>
        <div className={`rounded-xl shadow-sm p-6 transform hover:scale-105 transition duration-300 ${
          darkMode 
            ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 hover:shadow-lg'
            : 'bg-white border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-md'
        }`}>
          <CpuChipIcon className="w-6 h-6 text-indigo-500 mb-3" />
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>TSP Optimization</h3>
          <p className={`text-sm leading-relaxed ${
            darkMode ? 'text-gray-200' : 'text-gray-600'
          }`}>Solve multi-stop routes efficiently using OR-Tools.</p>
        </div>
        <div className={`rounded-xl shadow-sm p-6 transform hover:scale-105 transition duration-300 ${
          darkMode 
            ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 hover:shadow-lg'
            : 'bg-white border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-md'
        }`}>
          <MapPinIcon className="w-6 h-6 text-indigo-500 mb-3" />
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>Priority Stops</h3>
          <p className={`text-sm leading-relaxed ${
            darkMode ? 'text-gray-200' : 'text-gray-600'
          }`}>Reorder critical locations and respect constraints.</p>
        </div>
      </div>

      {/* How it Works */}
      <div className={`rounded-lg p-8 shadow-sm ${
        darkMode 
          ? 'bg-gradient-to-r from-gray-800 to-gray-700'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50'
      }`}>
        <h2 className={`text-3xl text-heading text-center mb-8`}>How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`text-center rounded-lg p-6 shadow-sm hover:shadow-md transition duration-300 ${
            darkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'
          }`}>
            <div className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ${
              darkMode ? 'bg-blue-800' : 'bg-blue-100'
            }`}>
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h4 className={`font-semibold text-heading mb-2`}>Add Locations</h4>
            <p className={`text-sm leading-relaxed text-body`}>Enter your start point and multiple stops</p>
          </div>

          <div className={`text-center rounded-lg p-6 shadow-sm hover:shadow-md transition duration-300 ${
            darkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'
          }`}>
            <div className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ${
              darkMode ? 'bg-blue-800' : 'bg-blue-100'
            }`}>
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h4 className={`font-medium mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Calculate Distances</h4>
            <p className={`text-sm leading-relaxed ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>Get real-time distance matrix between all points</p>
          </div>

          <div className={`text-center rounded-lg p-6 shadow-sm hover:shadow-md transition duration-300 ${
            darkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'
          }`}>
            <div className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ${
              darkMode ? 'bg-blue-800' : 'bg-blue-100'
            }`}>
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h4 className={`font-medium mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Optimize Route</h4>
            <p className={`text-sm leading-relaxed ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>AI finds the most efficient visiting order</p>
          </div>

          <div className={`text-center rounded-lg p-6 shadow-sm hover:shadow-md transition duration-300 ${
            darkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'
          }`}>
            <div className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ${
              darkMode ? 'bg-blue-800' : 'bg-blue-100'
            }`}>
              <span className="text-2xl font-bold text-blue-600">4</span>
            </div>
            <h4 className={`font-semibold text-heading mb-2`}>Export & Navigate</h4>
            <p className={`text-sm leading-relaxed text-body`}>Send to Google Maps for turn-by-turn directions</p>
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
  );
};

export default HomePage;
