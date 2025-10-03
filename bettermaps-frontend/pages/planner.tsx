import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import debounce from 'debounce'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import MapView from '../components/MapView'
import { nominatimSearch, NominatimSuggestion as Suggestion } from '../lib/geocode'

type Stop = {
  id: string
  name: string
  lat: number
  lng: number
  isPriority?: boolean
}

// Map primitives are handled inside MapView

export default function PlannerPage(): React.ReactElement {
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
  const [pendingClick, setPendingClick] = useState<[number, number] | null>(null)
  const [showNameModal, setShowNameModal] = useState(false)
  const [newStopName, setNewStopName] = useState('')
  const [previewKm, setPreviewKm] = useState<number | null>(null)
  const [undoAction, setUndoAction] = useState<{ type: 'add' | 'remove'; stop: Stop; index: number } | null>(null)
  const [showSearch, setShowSearch] = useState(true)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [savedRoutes, setSavedRoutes] = useState<Array<{ id: string; name: string; stops: Stop[] }>>([])
  const [recents, setRecents] = useState<Array<{ name: string; lat: number; lng: number }>>([])
  const [centerRequest, setCenterRequest] = useState<[number, number] | null>(null)

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
        setComputeError('Search rate limited or unavailable. Try again in a minute or consider self-hosting for heavy use.')
        setTimeout(() => setComputeError(null), 3000)
      }
    }, 300),
    []
  )

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    searchPlaces(q)
  }

  // Initialize drawer collapsed on small screens (mobile-first)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) setDrawerOpen(false)
    }
  }, [])

  // Escape exits fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
        setShowSearch(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullscreen])

  const handleSelectSuggestion = (s: Suggestion) => {
    setSelectedSuggestion(s)
    setQuery(s.display_name)
    setSuggestions([])
    setActiveIndex(-1)
    const lat = parseFloat(s.lat)
    const lng = parseFloat(s.lon)
    setCenterRequest([lat, lng])
    // Save to recents (max 5, unique by name+coords)
    try {
      const key = 'bettermaps_recent_searches'
      const current = recents ?? []
      const nextItem = { name: s.display_name, lat, lng }
      const filtered = current.filter((r) => !(r.name === nextItem.name && r.lat === nextItem.lat && r.lng === nextItem.lng))
      const next = [nextItem, ...filtered].slice(0, 5)
      setRecents(next)
      if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(next))
    } catch {}
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
    setUndoAction({ type: 'add', stop: newStop, index: (stops?.length ?? 0) })
    setSelectedSuggestion(null)
    void refreshPreviewDistance([...stops, newStop])
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
    setStops((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      if (idx >= 0) setUndoAction({ type: 'remove', stop: prev[idx], index: idx })
      const next = prev.filter((s) => s.id !== id)
      void refreshPreviewDistance(next)
      return next
    })
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

    // Direct routing fallback for exactly 2 stops
    if (stops.length === 2) {
      try {
        const a = stops[0]
        const b = stops[1]
        const coords = `${a.lng},${a.lat};${b.lng},${b.lat}`
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
        if (typeof route?.distance === 'number') setTotalDistanceM(route.distance)
        setOptimizedOrder([0, 1])
      } catch (e) {
        setComputeError('Could not compute route between the two stops. Please try again later.')
      }
      return
    }

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
      if (osrmRes.status === 429) {
        setComputeError('OSRM rate limit reached. Try again shortly or use a private OSRM instance for heavy use.')
        setTimeout(() => setComputeError(null), 4000)
        return
      }
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

  const refreshPreviewDistance = useMemo(() => debounce(async (currentStops: Stop[]) => {
    try {
      if (currentStops.length < 2) {
        setPreviewKm(null)
        return
      }
      const locations = currentStops.map((p) => ({ lat: p.lat, lng: p.lng, name: p.name }))
      const resp = await fetch('http://localhost:8000/distance-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations }),
      })
      if (resp.status === 429) {
        setComputeError('Rate limit reached. Try again in a minute or self-host Nominatim/OSRM for heavy use.')
        setTimeout(() => setComputeError(null), 3000)
        return
      }
      if (!resp.ok) return setPreviewKm(null)
      const data = await resp.json()
      const matrix: number[][] = data?.matrix || []
      let total = 0
      for (let i = 0; i < locations.length - 1; i++) total += matrix[i]?.[i + 1] ?? 0
      setPreviewKm(total / 1000)
    } catch {
      setPreviewKm(null)
    }
  }, 300), [])

  const undoLast = () => {
    if (!undoAction) return
    if (undoAction.type === 'add') {
      setStops((prev) => prev.filter((s) => s.id !== undoAction.stop.id))
      void refreshPreviewDistance(stops.filter((s) => s.id !== undoAction.stop.id))
    } else if (undoAction.type === 'remove') {
      setStops((prev) => {
        const next = [...prev]
        next.splice(undoAction.index, 0, undoAction.stop)
        void refreshPreviewDistance(next)
        return next
      })
    }
    setUndoAction(null)
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

  const addCurrentLocationAsStop = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const stop: Stop = {
        id: `${pos.coords.latitude},${pos.coords.longitude}-${Date.now()}`,
        name: 'Current Location',
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }
      const next = [...stops, stop]
      setStops(next)
      setUndoAction({ type: 'add', stop, index: stops.length })
      void refreshPreviewDistance(next)
    })
  }

  // Saved routes helpers
  const STORAGE_KEY = 'bettermaps_saved_routes'
  const refreshSavedRoutes = () => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setSavedRoutes(JSON.parse(raw))
      else setSavedRoutes([])
    } catch {
      setSavedRoutes([])
    }
  }

  const persistSavedRoutes = (routes: Array<{ id: string; name: string; stops: Stop[] }>) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routes))
    setSavedRoutes(routes)
  }

  const openSavedModal = () => {
    refreshSavedRoutes()
    setSaveName('')
    setShowSavedModal(true)
  }

  // Recents helpers
  const RECENTS_KEY = 'bettermaps_recent_searches'
  const refreshRecents = () => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(RECENTS_KEY)
      if (raw) setRecents(JSON.parse(raw))
      else setRecents([])
    } catch {
      setRecents([])
    }
  }

  const saveCurrentRoute = () => {
    const name = saveName.trim() || `Route ${new Date().toLocaleString()}`
    const newItem = { id: `${Date.now()}`, name, stops }
    const next = [...savedRoutes, newItem]
    persistSavedRoutes(next)
    setSaveName('')
  }

  const deleteSavedRoute = (id: string) => {
    const next = savedRoutes.filter((r) => r.id !== id)
    persistSavedRoutes(next)
  }

  const loadSavedRoute = (id: string) => {
    const r = savedRoutes.find((x) => x.id === id)
    if (!r) return
    setStops(r.stops)
    void refreshPreviewDistance(r.stops)
    setShowSavedModal(false)
  }

  // Exports
  const exportAsJson = () => {
    try {
      const payload = { stops }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'route.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  const copyShareLink = async () => {
    if (typeof window === 'undefined') return
    try {
      const json = JSON.stringify({ stops })
      const base64 = btoa(unescape(encodeURIComponent(json)))
      const link = `${window.location.origin}/share?data=${base64}`
      await navigator.clipboard.writeText(link)
      setComputeError('Share link copied to clipboard.')
      setTimeout(() => setComputeError(null), 2000)
    } catch {
      setComputeError('Could not copy share link.')
      setTimeout(() => setComputeError(null), 2000)
    }
  }

  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return
    const d: any = document
    const el: any = document.documentElement
    if (!d.fullscreenElement && el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {})
    } else if (d.exitFullscreen) {
      d.exitFullscreen().catch(() => {})
    }
  }

  return (
    <div className="w-full h-screen relative">
      {stops.length > 12 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50">
          <div className="overlay-panel text-sm">
            You have more than 12 stops. For best performance, split into multiple runs or consider BetterMaps Pro.
          </div>
        </div>
      )}
      {/* Search bar now provided by MapView's SearchBox overlay */}

      {/* Left Sidebar (collapsible) */}
      <div className={`absolute z-30 top-20 left-4 transition-smooth ${drawerOpen ? 'w-[min(92vw,420px)]' : 'w-10'}`}>
          <div className={`overlay-panel ${drawerOpen ? 'rounded-xl' : 'p-0'} relative`}>
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

                {/* Optimized Order summary */}
                {optimizedOrder && optimizedOrder.length > 0 && (
                  <div className="mb-3 text-sm text-body">
                    <div className="font-medium mb-1">Optimized Order</div>
                    <div className="truncate">
                      {optimizedOrder
                        .map((idx, i) => {
                          const nm = stops[idx]?.name ?? `${stops[idx]?.lat?.toFixed?.(2)}, ${stops[idx]?.lng?.toFixed?.(2)}`
                          return `${i + 1}. ${nm}`
                        })
                        .join(' \u2192 ')}
                    </div>
                  </div>
                )}
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="stops">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 max-h-[40vh] overflow-auto pr-1">
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
                                  <div className="text-sm font-medium text-heading truncate">{s.name}</div>
                                  <div className="text-xs text-muted truncate">{s.lat.toFixed(5)}, {s.lng.toFixed(5)}</div>
                                  <label className="mt-2 inline-flex items-center gap-2 text-xs text-body">
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
                  <button className="btn-secondary" onClick={() => setShowSavedModal(true)} aria-label="Open saved routes">Saved routes</button>
                  <button className="btn-primary" onClick={() => setShowSavedModal(true)} aria-label="Save current route">Save</button>
                </div>

                {/* Recents */}
                <div className="mt-6">
                  <div className="text-sm font-semibold mb-2">Recents</div>
                  {recents.length === 0 ? (
                    <div className="text-xs text-muted">No recent searches.</div>
                  ) : (
                    <ul className="space-y-2">
                      {recents.map((r, i) => (
                        <li key={`${r.lat}-${r.lng}-${i}`} className="flex items-center justify-between">
                          <button
                            className="underline text-left text-sm hover:text-blue-600 truncate"
                            title={r.name}
                            onClick={() => {
                              setQuery(r.name)
                              setCenterRequest([r.lat, r.lng])
                            }}
                          >
                            {r.name}
                          </button>
                          <span className="text-[11px] text-muted ml-2">{r.lat.toFixed(3)}, {r.lng.toFixed(3)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Map Area */}
      <div className="w-full h-screen relative">
        <MapView
          initialCenter={mapCenter}
          stops={stops}
          routePolyline={routePolyline}
          centerRequest={centerRequest}
          onMapClick={(ll) => setPendingClick(ll)}
          onAddStopFromMap={(ll, name) => {
            const stop = { id: `${ll[0]},${ll[1]}-${Date.now()}` , name: name ?? 'New Stop', lat: ll[0], lng: ll[1] }
            const next = [...stops, stop]
            setStops(next)
            setUndoAction({ type: 'add', stop, index: stops.length })
            void refreshPreviewDistance(next)
          }}
          onMarkerDrag={(idx, ll) => {
            setStops((prev) => {
              const next = [...prev]
              if (next[idx]) {
                next[idx] = { ...next[idx], lat: ll[0], lng: ll[1] }
              }
              void refreshPreviewDistance(next)
              return next
            })
          }}
          onMarkerContextRemove={(idx) => {
            const target = stops[idx]
            if (target) removeStop(target.id)
          }}
        />
      </div>

      {/* Floating Actions (Bottom-right) */}
      <div className="absolute right-4 bottom-4 z-40 flex flex-col items-end gap-2">
        <button
          className="fab fab-primary"
          title="Optimize Route"
          aria-label="Optimize Route"
          onClick={computeRoute}
        >
          ✨
        </button>
        <button className="fab fab-secondary" onClick={addCurrentLocationAsStop} aria-label="Add current location">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6H6m6 0h6" />
          </svg>
        </button>
        <button className="fab fab-secondary" onClick={toggleFullscreen} aria-label="Fullscreen">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h6v6m0-6L3.75 9.75m16.5-6h-6v6m0-6l6 6m-6 10.5h6v-6m0 6l-6-6m-10.5 6h6v-6m-6 6l6-6" />
          </svg>
        </button>
        <button className="fab fab-secondary" onClick={exportShare} aria-label="Export or Share">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0-15l-6 6m6-6l6 6" />
          </svg>
        </button>
      </div>

      {/* Contextual actions after map click */}
      {pendingClick && (
        <div className="absolute left-4 top-40 z-40">
          <div className="overlay-panel">
            <div className="text-sm text-body mb-2">Add stop at {pendingClick[0].toFixed(5)}, {pendingClick[1].toFixed(5)}?</div>
            <div className="flex gap-2">
              <button className="btn-primary" onClick={() => { setShowNameModal(true) }}>Add as Stop</button>
              <button className="btn-secondary" onClick={() => {
                // Set as start: replace first stop or create one
                setStops((prev) => {
                  const newStart: Stop = { id: `${Date.now()}`, name: 'Start', lat: pendingClick[0], lng: pendingClick[1] }
                  let next: Stop[]
                  if (prev.length === 0) next = [newStart]
                  else { next = [...prev]; next[0] = { ...next[0], lat: newStart.lat, lng: newStart.lng, name: newStart.name } }
                  setUndoAction({ type: 'add', stop: newStart, index: 0 })
                  void refreshPreviewDistance(next)
                  return next
                })
                setPendingClick(null)
              }}>Set as Start</button>
              <button className="btn-secondary" onClick={() => setPendingClick(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Mini modal to set stop name */}
      {showNameModal && pendingClick && (
        <div className="absolute left-4 bottom-40 z-40">
          <div className="overlay-panel">
            <div className="text-sm font-medium mb-2">Name this stop</div>
            <input className="input-field mb-3" value={newStopName} onChange={(e) => setNewStopName(e.target.value)} placeholder="e.g., Client HQ" />
            <div className="flex gap-2">
              <button className="btn-primary" onClick={() => {
                const stop: Stop = { id: `${Date.now()}`, name: newStopName || 'New Stop', lat: pendingClick[0], lng: pendingClick[1] }
                const next = [...stops, stop]
                setStops(next)
                setUndoAction({ type: 'add', stop, index: stops.length })
                setShowNameModal(false)
                setPendingClick(null)
                setNewStopName('')
                void refreshPreviewDistance(next)
              }}>Save</button>
              <button className="btn-secondary" onClick={() => { setShowNameModal(false); setPendingClick(null); setNewStopName('') }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Undo chip */}
      {undoAction && (
        <div className="absolute left-4 bottom-24 z-40">
          <button className="overlay-panel px-3 py-2 text-sm" onClick={undoLast} aria-label="Undo last action">Undo</button>
        </div>
      )}

      {/* Results Panel */}
      {(optimizedOrder || totalDistanceM || totalDurationS || computeError) && (
        <div className="absolute left-4 bottom-28 z-30 max-w-md">
          <div className="overlay-panel">
            {computeError && <div className="status-warning mb-3">{computeError}</div>}
            <div className="flex items-center gap-4 text-sm text-body">
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
                <div className="mt-3 flex gap-2">
                  <button className="btn-secondary" onClick={exportAsJson} aria-label="Download route as JSON">Download JSON</button>
                  <button className="btn-secondary" onClick={copyShareLink} aria-label="Copy share link">Copy Share Link</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Routes Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowSavedModal(false)} />
          <div className="overlay-panel relative max-w-lg w-[92vw]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Saved routes</h3>
              <button className="btn-secondary" onClick={() => setShowSavedModal(false)} aria-label="Close saved routes">Close</button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-heading mb-1">Save current as</label>
              <div className="flex gap-2">
                <input className="input-field" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Route name" />
                <button className="btn-primary" onClick={saveCurrentRoute} aria-label="Save current route">Save</button>
              </div>
            </div>
            <div className="max-h-64 overflow-auto">
              {savedRoutes.length === 0 ? (
                <div className="text-sm text-muted">No saved routes yet.</div>
              ) : (
                <ul className="space-y-2">
                  {savedRoutes.map((r) => (
                    <li key={r.id} className="flex items-center justify-between border border-gray-200 rounded p-2">
                      <div>
                        <div className="text-sm font-medium text-heading">{r.name}</div>
                        <div className="text-xs text-muted">{r.stops.length} stops</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="btn-primary" onClick={() => loadSavedRoute(r.id)} aria-label={`Load route ${r.name}`}>Load</button>
                        <button className="btn-secondary" onClick={() => deleteSavedRoute(r.id)} aria-label={`Delete route ${r.name}`}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
