import React, { useState } from 'react'
import Link from 'next/link'
import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, UserCircleIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'

interface NavbarProps {
  darkMode?: boolean
  onToggleDarkMode?: () => void
}

export default function Navbar({ darkMode = false, onToggleDarkMode }: NavbarProps): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavLinks = () => (
    <>
      <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        darkMode 
          ? 'text-gray-200 hover:text-white hover:bg-gray-700' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}>
        Home
      </Link>
      <Link href="/planner" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        darkMode 
          ? 'text-gray-200 hover:text-white hover:bg-gray-700' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}>
        Try Now
      </Link>
      <Link href="/download" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        darkMode 
          ? 'text-gray-200 hover:text-white hover:bg-gray-700' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}>
        Download App
      </Link>
      <Link href="/feedback" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        darkMode 
          ? 'text-gray-200 hover:text-white hover:bg-gray-700' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}>
        Feedback
      </Link>
    </>
  )

  return (
    <nav className={`sticky top-0 z-30 backdrop-blur border-b transition-colors flex items-center justify-between ${
      darkMode 
        ? 'bg-gray-800/80 border-gray-700' 
        : 'bg-white/80 border-gray-100'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
              <div className="h-8 w-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">BM</div>
              <span className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>BetterMaps</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md"
              aria-label="Open profile and settings"
            >
              <UserCircleIcon className="w-5 h-5 text-gray-600" />
            </button>
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className={`ml-3 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  darkMode 
                    ? 'text-gray-200 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  darkMode 
                    ? 'text-gray-200 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
            )}
            <button aria-label="Open menu" onClick={() => setMobileOpen(true)} className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              darkMode 
                ? 'text-gray-200 hover:text-white hover:bg-gray-700' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}>
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={mobileOpen}
        enter="transition duration-150 ease-out"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-100 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-2"
      >
        <div className={`md:hidden border-t ${
          darkMode 
            ? 'border-gray-700 bg-gray-800' 
            : 'border-gray-100 bg-white'
        }`}>
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <span className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Menu</span>
            <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              darkMode 
                ? 'text-gray-200 hover:text-white hover:bg-gray-700' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="container mx-auto px-4 pb-3 flex flex-col gap-1">
            <NavLinks />
          </div>
        </div>
      </Transition>

      
    </nav>
  )
}
