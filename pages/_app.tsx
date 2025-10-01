import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function AnimatedBackgroundContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-sky-50 bg-animated" />
      {children}
    </div>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AnimatedBackgroundContainer>
        <Navbar />
        <div key={router.asPath} className="page-fade">
          <Component {...pageProps} />
        </div>
        <Footer />
      </AnimatedBackgroundContainer>
    </>
  )
}


