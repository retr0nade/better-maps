import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Inter } from 'next/font/google'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

function AnimatedBackgroundContainer({ children, darkMode }: { children: React.ReactNode; darkMode: boolean }) {
  return (
    <div className={`min-h-screen relative ${darkMode ? 'dark' : ''}`}>
      <div className={`fixed inset-0 -z-10 bg-animated ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-slate-50 via-white to-sky-50'
      }`} />
      {children}
    </div>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true)
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={`${inter.variable} antialiased`}>
        <AnimatedBackgroundContainer darkMode={darkMode}>
        <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
        <div key={router.asPath} className="page-fade">
          <Component {...pageProps} darkMode={darkMode} />
        </div>
        <Footer darkMode={darkMode} />
        </AnimatedBackgroundContainer>
      </div>
    </>
  )
}


