import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../src/app/globals.css'
import 'leaflet/dist/leaflet.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navbar />
      <div className="page-fade">
        <Component {...pageProps} />
      </div>
      <Footer />
    </>
  )
}


