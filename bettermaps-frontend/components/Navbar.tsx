import React, { useState } from 'react'
import Link from 'next/link'
import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'

export default function Navbar(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavLinks = () => (
    <>
      <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        Home
      </Link>
      <Link href="/planner" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        Try Now
      </Link>
      <Link href="/download" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        Download App
      </Link>
      <Link href="/feedback" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        Feedback
      </Link>
    </>
  )

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
              <div className="h-8 w-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">BM</div>
              <span className="text-lg font-semibold text-gray-900">BetterMaps</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <NavLinks />
          </div>

          <div className="md:hidden">
            <button aria-label="Open menu" onClick={() => setMobileOpen(true)} className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Bars3Icon className="h-6 w-6 text-gray-700" />
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
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">Menu</span>
            <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          <div className="container mx-auto px-4 pb-3 flex flex-col gap-1">
            <NavLinks />
          </div>
        </div>
      </Transition>

      {/* Profile FAB (bottom-left) */}
      <Link
        href="#"
        aria-label="Open profile and settings"
        className="fab fab-secondary left-6 bottom-6"
        style={{ position: 'fixed' }}
      >
        <UserCircleIcon className="h-6 w-6" />
      </Link>
    </nav>
  )
}
