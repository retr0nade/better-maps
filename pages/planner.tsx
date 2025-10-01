import React, { useCallback, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import debounce from 'debounce'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { nominatimSearch, NominatimSuggestion as Suggestion } from '../lib/geocode'

type Stop = {
  id: string
  name: string
  lat: number
  lng: number
  isPriority?: boolean
}

const MapContainer = dynamic(async () => (await import('react-leaflet')).MapContainer, { ssr: false }) as any
const TileLayer = dynamic(async () => (await import('react-leaflet')).TileLayer, { ssr: false }) as any
const Marker = dynamic(async () => (await import('react-leaflet')).Marker, { ssr: false }) as any
const Popup = dynamic(async () => (await import('react-leaflet')).Popup, { ssr: false }) as any
const Polyline = dynamic(async () => (await import('react-leaflet')).Polyline, { ssr: false }) as any

export default function PlannerPage(): JSX.Element {
  const [stops, setStops] = useState<Stop[]>([])
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [optimizedOrder, setOptimizedOrder] = useState<number[] | null>(null)
  const [totalDistanceM, setTotalDistanceM] = useState<number | null>(null)
  const [totalDurationS, setTotalDurationS] = useState<number | null>(null)
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([])
  const [computeError, setComputeError] = useState<string | null>(null)

  const mapCenter = useMemo<[number, number]>(() => [37.773972, -122.431297], [])
  const mapRef = useRef<any>(null)

  const searchPlaces = useCallback(
    debounce(async (q: string) => {
      if (!q || q.length < 2) {
        setSuggestions([])
        setActiveIndex(-1)
        return
      }
      try {
        const data = await nominatimSearch(q)
        setSuggestions(data)
        setActiveIndex(data.length ? 0 : -1)
      } catch {
        setSuggestions([])
        setActiveIndex(-1)
      }
    }, 300),
    []
  )

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    searchPlaces(q)
  }

  const handleSelectSuggestion = (s: Suggestion) => {
    setSelectedSuggestion(s)
    setQuery(s.display_name)
    setSuggestions([])
    setActiveIndex(-1)
    const lat = parseFloat(s.lat)
    const lng = parseFloat(s.lon)
    if (mapRef.current) {
      const leaflet = mapRef.current
      if (leaflet && leaflet.setView) {
        leaflet.setView([lat, lng], 13)
      }
    }
  }

  const addSelectedAsStop = () => {
    if (!selectedSuggestion) return
    const lat = parseFloat(selectedSuggestion.lat)
    const lng = parseFloat(selectedSuggestion.lon)
    const newStop: Stop = {
      id: `${lat},${lng}-${Date.now()}`,
      name: selectedSuggestion.display_name,
      lat,
      lng,
    }
    setStops((prev) => [...prev, newStop])
    setSelectedSuggestion(null)
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const reordered = Array.from(stops)
    const [removed] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, removed)
    setStops(reordered)
  }

  const togglePriority = (id: string) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, isPriority: !s.isPriority } : s)))
  }

  const removeStop = (id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id))
  }

  const addManualStop = async (address: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
      const data: Suggestion[] = await res.json()
      if (data[0]) {
        const s = data[0]
        const lat = parseFloat(s.lat)
        const lng = parseFloat(s.lon)
        setStops((prev) => [
          ...prev,
          { id: `${lat},${lng}-${Date.now()}`, name: s.display_name, lat, lng },
        ])
      }
    } catch {}
  }

  const computeRoute = async () => {
    setComputeError(null)
    setRoutePolyline([])
    setOptimizedOrder(null)
    setTotalDistanceM(null)
    setTotalDurationS(null)
    if (stops.length < 2) return

    // 1) Collect current order as locations (treat first as start for now)
    const locations = stops.map((s) => ({ lat: s.lat, lng: s.lng }))

    // 2) Priority indices in current order
    const priority = stops.map((s, i) => (s.isPriority ? i : -1)).filter((i) => i >= 0)

    try {
      // 3) Call backend optimizer
      const res = await fetch('http://127.0.0.1:8000/optimize-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations, priority }),
      })
      if (!res.ok) throw new Error('Optimization failed')
      const data = await res.json()
      const order: number[] = data.optimized_order
      const totalM: number | undefined = data.total_distance_m
      setOptimizedOrder(order)
      if (typeof totalM === 'number') setTotalDistanceM(totalM)

      // 4) Build OSRM coordinates string in lng,lat order using optimized order
      const orderedPoints = order.map((idx) => locations[idx])
      const coords = orderedPoints.map((p) => `${p.lng},${p.lat}`).join(';')
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false` 

      const osrmRes = await fetch(osrmUrl)
      if (!osrmRes.ok) throw new Error('OSRM request failed')
      const osrm = await osrmRes.json()
      const route = osrm?.routes?.[0]
      if (route?.geometry?.coordinates) {
        const latlngs: [number, number][] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
        setRoutePolyline(latlngs)
      }
      if (typeof route?.duration === 'number') setTotalDurationS(route.duration)
    } catch (e) {
      setComputeError('Could not compute optimized route. Using current order. You can still navigate or try again later.')
    }
  }

  const exportShare = () => {
    if (stops.length === 0) return
    const origin = stops[0]
    const destination = stops[stops.length - 1]
    const waypoints = stops.slice(1, -1)
    let url = `https://www.google.com/maps/dir/${origin.lat},${origin.lng}/`
    if (waypoints.length > 0) url += waypoints.map((w) => `${w.lat},${w.lng}`).join('/') + '/'
    url += `${destination.lat},${destination.lng}`
    if (typeof window !== 'undefined') window.open(url, '_blank')
  }

  return (
    <div className={`min-h-screen ${isFullscreen ? '' : 'relative'}`}>
      {/* Search Bar (Top-left) */}
      <div className="absolute left-4 top-20 z-40 w-[min(92vw,420px)]">
        <div className="overlay-panel">
          <input
            value={query}
            onChange={onQueryChange}
            placeholder="Search places..."
            aria-label="Search places"
            className="input-field"
            onKeyDown={(e) => {
              if (!suggestions.length) return
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActiveIndex((i) => (i + 1) % suggestions.length)
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length)
              } else if (e.key === 'Enter') {
                e.preventDefault()
                if (activeIndex >= 0) handleSelectSuggestion(suggestions[activeIndex])
              } else if (e.key === 'Escape') {
                setSuggestions([])
                setActiveIndex(-1)
              }
            }}
          />
          {suggestions.length > 0 && (
            <div className="mt-2 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow" role="listbox">
              {suggestions.map((s, idx) => (
                <button
                  key={`${s.lat}-${s.lon}`}
                  onClick={() => handleSelectSuggestion(s)}
                  role="option"
                  aria-selected={activeIndex === idx}
                  className={`w-full text-left px-3 py-2 focus:outline-none ${activeIndex === idx ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  {s.display_name}
                </button>
              ))}
              <div className="px-3 py-2 text-xs text-gray-400 border-t">
                Uses Nominatim. See usage policy: <a className="underline" href="https://operations.osmfoundation.org/policies/nominatim/" target="_blank" rel="noreferrer">policy</a>.
              </div>
            </div>
          )}
          {selectedSuggestion && (
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-gray-600 truncate mr-3">Selected: {selectedSuggestion.display_name}</span>
              <button onClick={addSelectedAsStop} className="btn-primary" aria-label="Add selected place as stop">Add as stop</button>
            </div>
          )}
        </div>
      </div>

      {/* Right Drawer */}
      <div className={`fixed top-20 right-4 z-30 transition-smooth ${drawerOpen ? 'w-[90vw] sm:w-[420px]' : 'w-10'} `}>
        <div className={`overlay-panel ${drawerOpen ? '' : 'p-0'} relative`}>
          <button
            aria-label={drawerOpen ? 'Collapse panel' : 'Expand panel'}
            className="absolute -left-3 top-4 h-8 w-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50"
            onClick={() => setDrawerOpen((v) => !v)}
          >
            {drawerOpen ? '⟶' : '⟵'}
          </button>

          {drawerOpen && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Stops</h2>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="stops">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                      {stops.map((s, idx) => (
                        <Draggable draggableId={s.id} index={idx} key={s.id}>
                          {(drag) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
                                <div className="text-xs text-gray-500 truncate">{s.lat.toFixed(5)}, {s.lng.toFixed(5)}</div>
                                <label className="mt-2 inline-flex items-center gap-2 text-xs text-gray-600">
                                  <input type="checkbox" checked={!!s.isPriority} onChange={() => togglePriority(s.id)} />
                                  Priority stop
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="btn-secondary" onClick={() => removeStop(s.id)} aria-label="Remove stop">Remove</button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className="mt-4 flex gap-2">
                <input id="manualAddress" placeholder="Add stop by address" className="input-field" aria-label="Add stop by address" />
                <button
                  className="btn-primary"
                  onClick={() => {
                    const el = document.getElementById('manualAddress') as HTMLInputElement | null
                    if (el && el.value.trim()) {
                      addManualStop(el.value.trim())
                      el.value = ''
                    }
                  }}
                >
                  Add
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="btn-secondary" aria-label="Save route">Save</button>
                <button className="btn-secondary" aria-label="Load route">Load</button>
              </div>
                  </div>
                )}
              </div>
            </div>

      {/* Map Area */}
      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-20' : 'container mx-auto px-4'} mt-4`}>
        <div className="rounded-xl overflow-hidden bg-white shadow">
          <div className="fullmap">
            <MapContainer
              center={mapCenter}
              zoom={12}
              scrollWheelZoom
              whenCreated={(map) => (mapRef.current = map)}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {stops.map((s) => (
                <Marker key={s.id} position={[s.lat, s.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold mb-1">{s.name}</div>
                      <button className="btn-secondary" onClick={() => removeStop(s.id)} aria-label="Remove stop">Remove</button>
          </div>
                  </Popup>
                </Marker>
              ))}
              {routePolyline.length > 1 && (
                <Polyline positions={routePolyline} pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.85 }} />
              )}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Floating Actions (Bottom-right) */}
      <div className="fab-container">
        <button className="fab" onClick={computeRoute} aria-label="Compute Route">
          ▶
        </button>
        <button className="fab fab-secondary" onClick={() => setIsFullscreen((v) => !v)} aria-label="Toggle Fullscreen Map">
          ⛶
        </button>
        <button className="fab fab-secondary" onClick={exportShare} aria-label="Export or Share">
          ↗
        </button>
      </div>

      {/* Results Panel */}
      {(optimizedOrder || totalDistanceM || totalDurationS || computeError) && (
        <div className="absolute left-4 bottom-28 z-30 max-w-md">
          <div className="overlay-panel">
            {computeError && <div className="status-warning mb-3">{computeError}</div>}
            <div className="flex items-center gap-4 text-sm text-gray-700">
              {typeof totalDistanceM === 'number' && (
                <span><strong>Distance:</strong> {(totalDistanceM / 1000).toFixed(2)} km</span>
              )}
              {typeof totalDurationS === 'number' && (
                <span><strong>Duration:</strong> {Math.round(totalDurationS / 60)} min</span>
              )}
            </div>
            {optimizedOrder && (
              <div className="mt-3">
                <div className="text-sm font-medium mb-2">Sequence</div>
                <ol className="space-y-1 text-sm">
                  {optimizedOrder.map((idx, i) => (
                    <li key={`${idx}-${i}`}>
                      <button
                        className="underline hover:text-blue-600"
                        onClick={() => {
                          const p = stops[idx]
                          if (p && mapRef.current?.setView) mapRef.current.setView([p.lat, p.lng], 14)
                        }}
                      >
                        {i + 1}. {stops[idx]?.name ?? `${stops[idx]?.lat?.toFixed?.(4)}, ${stops[idx]?.lng?.toFixed?.(4)}`}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
