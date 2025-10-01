import React, { useState } from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold">BM</span>
              <span className="text-lg font-semibold text-gray-900">BetterMaps</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/planner" className="text-gray-700 hover:text-blue-600 transition-colors">Try Now</Link>
            <Link href="/download" className="text-gray-700 hover:text-blue-600 transition-colors">Download App</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg className={`h-6 w-6 ${open ? 'hidden' : 'block'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <svg className={`h-6 w-6 ${open ? 'block' : 'hidden'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div className={`${open ? 'block' : 'hidden'} md:hidden border-t border-gray-100 bg-white`}
           onClick={() => setOpen(false)}>
        <div className="container mx-auto px-4 py-3 space-y-1">
          <Link href="/" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">Home</Link>
          <Link href="/planner" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">Try Now</Link>
          <Link href="/download" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">Download App</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


