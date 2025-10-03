import React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamically load react-tsparticles to avoid SSR issues
const Particles = dynamic(async () => {
  const mod: any = await import('react-tsparticles')
  return mod.default ?? mod.Particles
}, { ssr: false }) as unknown as React.ComponentType<any>

interface AnimatedHeroProps {
  darkMode?: boolean
}

export default function AnimatedHero({ darkMode = false }: AnimatedHeroProps): JSX.Element {
  const particleOptions = {
    fpsLimit: 30,
    background: { color: 'transparent' },
    detectRetina: true,
    fullScreen: { enable: false },
    particles: {
      number: { value: 40, density: { enable: true, area: 800 } },
      color: { value: '#38bdf8' },
      links: { enable: true, color: '#93c5fd', distance: 120, opacity: 0.35, width: 1 },
      move: { enable: true, speed: 1.2, outModes: { default: 'out' } },
      opacity: { value: 0.4 },
      size: { value: { min: 1, max: 3 } },
    },
    interactivity: {
      events: { onHover: { enable: true, mode: 'repulse' }, resize: true },
      modes: { repulse: { distance: 80, duration: 0.3 } },
    },
  }

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-heading`}>
            BetterMaps — Optimize Your Multi-Stop Routes
          </h1>
          <p className={`text-lg md:text-xl mb-8 max-w-xl text-body`}>
            Plan, analyze, and optimize complex routes with ease. Visualize distances, prioritize stops, and export to navigation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/planner"
              aria-label="Try BetterMaps planner now"
              className="btn-primary"
            >
              Try Now
            </Link>
            <Link
              href="/download"
              aria-label="Download BetterMaps app"
              className="btn-secondary"
            >
              Download App
            </Link>
          </div>
        </div>

        <div className="relative h-72 md:h-96">
          <div className={`absolute inset-0 right-0 rounded-2xl backdrop-blur-md shadow-xl border p-4 ${
            darkMode 
              ? 'bg-gray-800/70 border-gray-700'
              : 'bg-white/80 border-white/40'
          }`}>
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 hidden lg:block">
                <Particles id="heroParticles" options={particleOptions} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className={`rounded-xl backdrop-blur shadow-md p-4 md:p-6 ${
                  darkMode ? 'bg-gray-700/80' : 'bg-white/80'
                }`}>
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Globe illustration"
                  >
                    <circle cx="60" cy="60" r="56" stroke="#60a5fa" strokeWidth="2" fill={darkMode ? '#374151' : '#eff6ff'} />
                    <path d="M4 60h112" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />
                    <path d="M60 4v112" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />
                    <ellipse cx="60" cy="60" rx="40" ry="18" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
                    <ellipse cx="60" cy="60" rx="18" ry="40" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


