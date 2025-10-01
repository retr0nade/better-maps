import React from 'react'
import AnimatedHero from '../components/AnimatedHero'
import Link from 'next/link'

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <main className="flex-1">
        <AnimatedHero />

        {/* Condensed Features */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="overlay-panel"><h3 className="text-lg font-semibold mb-2">Distance Overview</h3><p className="text-gray-600 text-sm">Quickly inspect distances and ETAs between multiple stops.</p></div>
              <div className="overlay-panel"><h3 className="text-lg font-semibold mb-2">TSP Optimization</h3><p className="text-gray-600 text-sm">Solve multi-stop routes efficiently using OR-Tools.</p></div>
              <div className="overlay-panel"><h3 className="text-lg font-semibold mb-2">Priority Stops</h3><p className="text-gray-600 text-sm">Reorder critical locations and respect constraints.</p></div>
            </div>
          </div>
        </section>
        {/* Feedback CTA instead of testimonials */}
        <section className="bg-white/70">
          <div className="container mx-auto px-4 py-16 md:py-20 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Have ideas to make BetterMaps better?</h3>
            <Link href="/feedback" className="btn-primary" aria-label="Leave feedback for BetterMaps">Leave feedback</Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;


