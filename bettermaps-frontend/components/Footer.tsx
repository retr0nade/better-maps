import React from 'react'
import Link from 'next/link'

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
    >
      {children}
    </Link>
  )
}

interface FooterProps {
  darkMode?: boolean
}

export default function Footer({ darkMode = false }: FooterProps): React.ReactElement {
  const year = new Date().getFullYear()
  return (
    <footer className={`mt-16 ${
      darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-900 text-gray-300'
    }`}>
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-md bg-blue-600 text-white flex items-center justify-center text-sm font-bold">BM</div>
              <span className="text-white font-semibold">BetterMaps</span>
            </div>
            <p className={`text-sm ${
              darkMode ? 'text-gray-200' : 'text-gray-600'
            }`}>Optimize your multi-stop routes.</p>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">Home</Link>
            <Link href="/planner" className="text-sm hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">Try Now</Link>
            <Link href="/download" className="text-sm hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">Download</Link>
            <Link href="/feedback" className="text-sm hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">Feedback</Link>
          </nav>

          <div className="flex items-center gap-1">
            <SocialLink href="https://twitter.com" label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M19.633 7.997c.013.18.013.36.013.54 0 5.49-4.177 11.82-11.82 11.82-2.35 0-4.532-.69-6.37-1.88.33.04.65.053.99.053a8.36 8.36 0 0 0 5.18-1.78 4.18 4.18 0 0 1-3.9-2.9c.26.04.52.066.79.066.38 0 .76-.053 1.11-.146a4.17 4.17 0 0 1-3.35-4.09v-.053c.56.31 1.2.5 1.88.52a4.16 4.16 0 0 1-1.86-3.46c0-.78.21-1.5.58-2.13a11.83 11.83 0 0 0 8.59 4.36 4.7 4.7 0 0 1-.1-.95 4.17 4.17 0 0 1 7.22-2.85 8.2 8.2 0 0 0 2.64-1 4.18 4.18 0 0 1-1.83 2.3 8.38 8.38 0 0 0 2.4-.63 9.01 9.01 0 0 1-2.09 2.16z" />
              </svg>
            </SocialLink>
            <SocialLink href="https://linkedin.com" label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.79-1.75-1.764 0-.974.784-1.764 1.75-1.764s1.75.79 1.75 1.764c0 .974-.784 1.764-1.75 1.764zm13.5 11.268h-3v-5.604c0-1.336-.027-3.056-1.861-3.056-1.862 0-2.147 1.454-2.147 2.957v5.703h-3v-10h2.881v1.367h.041c.401-.76 1.381-1.56 2.842-1.56 3.041 0 3.604 2.002 3.604 4.605v5.588z" />
              </svg>
            </SocialLink>
            <SocialLink href="https://github.com" label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.486 2 12.021c0 4.429 2.865 8.185 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.865-.013-1.698-2.782.605-3.369-1.343-3.369-1.343-.455-1.163-1.11-1.473-1.11-1.473-.908-.62.069-.607.069-.607 1.004.071 1.532 1.03 1.532 1.03.892 1.531 2.341 1.089 2.91.833.092-.65.35-1.089.636-1.34-2.221-.254-4.556-1.112-4.556-4.952 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.85-2.338 4.695-4.566 4.944.359.31.678.92.678 1.855 0 1.339-.012 2.419-.012 2.747 0 .267.18.578.688.48C19.138 20.203 22 16.448 22 12.02 22 6.487 17.522 2 12 2Z" clipRule="evenodd" />
              </svg>
            </SocialLink>
          </div>
        </div>

        <div className={`mt-8 border-t pt-6 text-center text-sm ${
          darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'
        }`}>
          © {year} BetterMaps. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
