import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_35%)]" />
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">Smart Route Planning</span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
                BetterMaps: Optimize Your Multi-Stop Routes
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-600">
                Save time, reduce travel distance, and plan smarter trips.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/planner"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors duration-200"
                >
                  Try Now
                </Link>
                <Link
                  href="/download"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-blue-700 font-semibold ring-1 ring-blue-200 hover:ring-blue-300 hover:bg-blue-50 transition-colors duration-200"
                >
                  Download App
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why BetterMaps */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">Why BetterMaps?</h2>
            <p className="mt-4 text-center text-gray-600 max-w-3xl mx-auto">
              A complete toolkit for delivery routes, field visits, and road trips.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Distance Overview</h3>
                <p className="text-gray-600">Instant distance matrix to compare all stops and plan with clarity.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">⚙️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">TSP Optimization</h3>
                <p className="text-gray-600">AI-powered ordering to minimize total travel using TSP heuristics.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">⭐</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Priority Stops</h3>
                <p className="text-gray-600">Lock in must-visit points first and optimize around them.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Testimonials */}
        <section className="bg-white/70">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="grid gap-8 md:grid-cols-2 items-stretch">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Built for Teams and Individuals</h3>
                <ul className="space-y-3 text-blue-50">
                  <li className="flex gap-3"><span>✅</span><span>Interactive map with draggable view and clear markers</span></li>
                  <li className="flex gap-3"><span>✅</span><span>Export to Google Maps for turn‑by‑turn navigation</span></li>
                  <li className="flex gap-3"><span>✅</span><span>Fast, responsive UI powered by Next.js and Tailwind</span></li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What users say</h3>
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-gray-50 ring-1 ring-gray-100">
                    <p className="text-gray-700">“Cut our route times by 25%. Simple and effective.”</p>
                    <p className="mt-3 text-sm text-gray-500">— Operations Lead, Local Courier</p>
                  </div>
                  <div className="p-5 rounded-xl bg-gray-50 ring-1 ring-gray-100">
                    <p className="text-gray-700">“Love the matrix view and one‑click export to Google Maps.”</p>
                    <p className="mt-3 text-sm text-gray-500">— Sales Rep, Field Services</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;


