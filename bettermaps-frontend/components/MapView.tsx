import React, { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import react-leaflet primitives to be SSR-safe
const MapContainer = dynamic(async () => (await import('react-leaflet')).MapContainer, { ssr: false }) as any
const TileLayer = dynamic(async () => (await import('react-leaflet')).TileLayer, { ssr: false }) as any
const Marker = dynamic(async () => (await import('react-leaflet')).Marker, { ssr: false }) as any
const Popup = dynamic(async () => (await import('react-leaflet')).Popup, { ssr: false }) as any
const Polyline = dynamic(async () => (await import('react-leaflet')).Polyline, { ssr: false }) as any
const useMap = (await import('react-leaflet')).useMap as unknown as () => any // will be used inside child component only
const useMapEvents = (await import('react-leaflet')).useMapEvents as unknown as (events: any) => any

export type LatLngTuple = [number, number]

export type MapStop = {
  id?: string
  name?: string
  lat: number
  lng: number
}

type Props = {
  initialCenter?: LatLngTuple
  stops: MapStop[]
  routePolyline?: LatLngTuple[]
  onMapClick?: (latlng: LatLngTuple) => void
  onMarkerDrag?: (index: number, latlng: LatLngTuple) => void
  onCenterChange?: (center: LatLngTuple) => void
  onMarkerContextRemove?: (index: number) => void
  followMeEnabled?: boolean
  onToggleFollowMe?: (enabled: boolean) => void
  onSetAsStart?: (index: number) => void
  onAddStopFromMap?: (latlng: LatLngTuple, name?: string) => void
  centerRequest?: LatLngTuple | null
}

function MapEvents({ onClick, onCenterChange }: { onClick?: (ll: LatLngTuple) => void; onCenterChange?: (c: LatLngTuple) => void }) {
  const map = (useMap as any)()
  useMapEvents({
    click(e: any) {
      if (onClick) onClick([e.latlng.lat, e.latlng.lng])
    },
    moveend() {
      const c = map.getCenter()
      if (onCenterChange) onCenterChange([c.lat, c.lng])
    },
  })
  return null
}

export default function MapView({
  initialCenter,
  stops,
  routePolyline,
  onMapClick,
  onMarkerDrag,
  onCenterChange,
  onMarkerContextRemove,
  followMeEnabled,
  onToggleFollowMe,
  onSetAsStart,
  onAddStopFromMap,
  centerRequest,
}: Props): React.ReactElement {
  const defaultCenter: LatLngTuple = initialCenter ?? [20.5937, 78.9629]
  const [mounted, setMounted] = useState(false)
  const [userPos, setUserPos] = useState<LatLngTuple | null>(null)
  const mapRef = useRef<any>(null)
  const watchIdRef = useRef<number | null>(null)
  const [ClusterComponent, setClusterComponent] = useState<any>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [layerType, setLayerType] = useState<'default' | 'satellite'>('default')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Attempt to load clustering at runtime without forcing a build-time dependency
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const moduleName = 'react-leaflet-cluster'
      // Use dynamic runtime import via Function to avoid bundler resolution
      const dynImport: (m: string) => Promise<any> = new Function(
        'm',
        'return import(m)'
      ) as any
      dynImport(moduleName)
        .then((mod: any) => setClusterComponent(mod?.default ?? null))
        .catch(() => setClusterComponent(null))
    } catch {
      setClusterComponent(null)
    }
  }, [])

  // Geolocation request on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('geolocation' in navigator)) {
      setToast("We couldn’t detect your location. Search or add manually.")
      if (mapRef.current?.flyTo) mapRef.current.flyTo(defaultCenter, 5, { animate: true })
      setTimeout(() => setToast(null), 3000)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ll: LatLngTuple = [pos.coords.latitude, pos.coords.longitude]
        setUserPos(ll)
        if (mapRef.current?.flyTo) {
          mapRef.current.flyTo(ll, 14, { animate: true })
        } else if (mapRef.current?.setView) {
          mapRef.current.setView(ll, 14, { animate: true })
        }
      },
      () => {
        setToast("We couldn’t detect your location. Search or add manually.")
        if (mapRef.current?.flyTo) mapRef.current.flyTo(defaultCenter, 5, { animate: true })
        setTimeout(() => setToast(null), 3000)
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    )
  }, [])

  // Follow-me toggle handling (watchPosition)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('geolocation' in navigator)) return
    if (followMeEnabled) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const ll: LatLngTuple = [pos.coords.latitude, pos.coords.longitude]
          setUserPos(ll)
          if (mapRef.current && mapRef.current.setView) {
            mapRef.current.setView(ll)
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
      )
      watchIdRef.current = id as unknown as number
      return () => {
        if (watchIdRef.current != null && navigator.geolocation.clearWatch) {
          navigator.geolocation.clearWatch(watchIdRef.current)
          watchIdRef.current = null
        }
      }
    }
  }, [followMeEnabled])

  // Respond to external center requests from parent
  useEffect(() => {
    if (!centerRequest) return
    if (mapRef.current?.flyTo) mapRef.current.flyTo(centerRequest, 14, { animate: true })
    else if (mapRef.current?.setView) mapRef.current.setView(centerRequest, 14, { animate: true })
  }, [centerRequest])

  const handleMarkerDrag = (index: number, e: any) => {
    const lat = e.target.getLatLng().lat
    const lng = e.target.getLatLng().lng
    if (onMarkerDrag) onMarkerDrag(index, [lat, lng])
  }

  // Prevent page scroll when mouse over the map (wheel events)
  useEffect(() => {
    if (!mapRef.current) return
    const container: HTMLElement | null = mapRef.current.getContainer?.()
    if (!container) return
    const onWheel = (e: WheelEvent) => {
      // Allow the map to handle the wheel, but stop the page from scrolling
      e.preventDefault()
    }
    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel as any)
  }, [mapRef.current])

  if (!mounted) return <div className="fullmap page-fade" />

  return (
    <div className="relative">
      {/* Low-contrast overlay area for UI elements could be slotted above map by parent */}
      <div className="rounded-xl overflow-hidden shadow-sm">
        <MapContainer
          center={defaultCenter}
          zoom={5}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          zoomControl={false}
          whenCreated={(map: any) => (mapRef.current = map)}
          className="fullmap page-fade"
        >
          {layerType === 'default' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          {layerType === 'satellite' && (
            <TileLayer
              attribution='Tiles &copy; Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          {/* Map events for click + center change */}
          <MapEvents onClick={(ll) => onMapClick && onMapClick(ll)} onCenterChange={(c) => onCenterChange && onCenterChange(c)} />

          {/* User location */}
          {userPos && (
            <Marker position={userPos}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Stops markers with optional runtime clustering */}
          {ClusterComponent ? (
            <ClusterComponent chunkedLoading>
              {stops.map((s, idx) => (
                <Marker
                  key={s.id ?? `${s.lat},${s.lng}-${idx}`}
                  position={[s.lat, s.lng]}
                  draggable
                  eventHandlers={{
                    dragend: (e: any) => handleMarkerDrag(idx, e),
                    contextmenu: () => onMarkerContextRemove && onMarkerContextRemove(idx),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold mb-1">{s.name ?? 'Waypoint'}</div>
                      <button className="btn-primary" onClick={() => onMarkerContextRemove && onMarkerContextRemove(idx)} aria-label="Remove stop">
                        Remove stop
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </ClusterComponent>
          ) : (
            stops.map((s, idx) => (
              <Marker
                key={s.id ?? `${s.lat},${s.lng}-${idx}`}
                position={[s.lat, s.lng]}
                draggable
                eventHandlers={{
                  dragend: (e: any) => handleMarkerDrag(idx, e),
                  contextmenu: () => onMarkerContextRemove && onMarkerContextRemove(idx),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">{s.name ?? 'Waypoint'}</div>
                    <div className="text-xs text-muted mb-2">{s.lat.toFixed(5)}, {s.lng.toFixed(5)}</div>
                    <div className="flex gap-2">
                      <button className="btn-secondary" onClick={() => onSetAsStart && onSetAsStart(idx)} aria-label="Set as start">Set as Start</button>
                      <button className="btn-primary" onClick={() => onAddStopFromMap && onAddStopFromMap([s.lat, s.lng], s.name)} aria-label="Add to route">Add to Route</button>
                      <button className="btn-secondary" onClick={() => onMarkerContextRemove && onMarkerContextRemove(idx)} aria-label="Remove stop">Remove</button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))
          )}

          {/* Route polyline */}
          {routePolyline && routePolyline.length > 1 && (
            <Polyline positions={routePolyline} pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.85 }} />
          )}
        </MapContainer>
      </div>

      {/* Re-center to user FAB (bottom-right) */}
      <div className="absolute right-3 bottom-3 z-[401]">
        <button
          className="fab fab-secondary"
          aria-label="Re-center to my location"
          onClick={() => {
            if (userPos && mapRef.current?.flyTo) {
              mapRef.current.flyTo(userPos, 14, { animate: true })
              return
            }
            if (typeof window === 'undefined' || !('geolocation' in navigator)) {
              setToast("We couldn’t detect your location. Search or add manually.")
              setTimeout(() => setToast(null), 3000)
              return
            }
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const ll: LatLngTuple = [pos.coords.latitude, pos.coords.longitude]
                setUserPos(ll)
                if (mapRef.current?.flyTo) mapRef.current.flyTo(ll, 14, { animate: true })
              },
              () => {
                setToast("We couldn’t detect your location. Search or add manually.")
                setTimeout(() => setToast(null), 3000)
              },
              { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
            )
          }}
        >
          🎯
        </button>
      </div>

      {/* Zoom controls (custom) */}
      <div className="absolute right-3 top-14 z-[401] flex flex-col gap-2">
        <button
          className="overlay-panel px-3 py-1 text-sm"
          aria-label="Zoom in"
          onClick={() => mapRef.current && mapRef.current.zoomIn?.()}
        >
          +
        </button>
        <button
          className="overlay-panel px-3 py-1 text-sm"
          aria-label="Zoom out"
          onClick={() => mapRef.current && mapRef.current.zoomOut?.()}
        >
          -
        </button>
      </div>

      {/* Layers toggle (bottom-left) */}
      <div className="absolute left-3 bottom-3 z-[401] flex items-center gap-2">
        <div className="overlay-panel px-2 py-1 text-xs">
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1 text-body">
              <input
                type="radio"
                name="layerType"
                checked={layerType === 'default'}
                onChange={() => setLayerType('default')}
              />
              Default
            </label>
            <label className="inline-flex items-center gap-1 text-body">
              <input
                type="radio"
                name="layerType"
                checked={layerType === 'satellite'}
                onChange={() => setLayerType('satellite')}
              />
              Satellite
            </label>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-[402]">
          <div className="overlay-panel px-3 py-2 text-sm">{toast}</div>
        </div>
      )}

      {/* Follow me toggle overlay */}
      <div className="absolute top-3 right-3">
        <button
          className="overlay-panel px-3 py-2 text-sm"
          onClick={() => onToggleFollowMe && onToggleFollowMe(!followMeEnabled)}
          aria-label="Toggle follow me"
        >
          {followMeEnabled ? 'Following you' : 'Follow me'}
        </button>
      </div>
    </div>
  )
}
