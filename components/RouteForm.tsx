import React, { useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Bars3Icon, TrashIcon } from '@heroicons/react/24/outline'

export type RouteStop = {
  id: string
  name: string
  lat: number
  lng: number
  isPriority?: boolean
}

type Props = {
  start: RouteStop
  stops: RouteStop[]
  onChange: (payload: { start: RouteStop; stops: RouteStop[]; priorityIndices: number[] }) => void
  onOpenSearch?: () => void
  enableDistancePreview?: boolean
}

export default function RouteForm({ start, stops: externalStops, onChange, onOpenSearch, enableDistancePreview }: Props): JSX.Element {
  const [localStart, setLocalStart] = useState<RouteStop>(start)
  const [localStops, setLocalStops] = useState<RouteStop[]>(externalStops)
  const [warnings, setWarnings] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewKm, setPreviewKm] = useState<number | null>(null)
  const maxStops = 12

  const priorityIndices = useMemo(() => localStops.map((s, i) => (s.isPriority ? i : -1)).filter((v) => v >= 0), [localStops])

  const emitChange = (nextStart: RouteStop, nextStops: RouteStop[]) => {
    onChange({ start: nextStart, stops: nextStops, priorityIndices: nextStops.map((s, i) => (s.isPriority ? i : -1)).filter((i) => i >= 0) })
  }

  const validateLatLng = (v: string): number | null => {
    if (v.trim() === '') return null
    const num = Number(v)
    if (!Number.isFinite(num)) return null
    return num
  }

  const handleStartChange = (field: 'name' | 'lat' | 'lng', value: string) => {
    const next = { ...localStart }
    if (field === 'name') {
      next.name = value
    } else {
      const num = validateLatLng(value)
      if (num == null) {
        setErrors((e) => ({ ...e, [`start.${field}`]: 'Invalid number' }))
        return
      } else {
        setErrors((e) => ({ ...e, [`start.${field}`]: '' }))
        ;(next as any)[field] = num
      }
    }
    setLocalStart(next)
    emitChange(next, localStops)
    if (enableDistancePreview) void refreshPreview(next, localStops)
  }

  const handleStopChange = (idx: number, field: 'name' | 'lat' | 'lng' | 'isPriority', value: string | boolean) => {
    const next = localStops.map((s) => ({ ...s }))
    if (field === 'isPriority') {
      next[idx].isPriority = Boolean(value)
    } else if (field === 'name') {
      next[idx].name = String(value)
    } else {
      const num = validateLatLng(String(value))
      if (num == null) {
        setErrors((e) => ({ ...e, [`stop.${idx}.${field}`]: 'Invalid number' }))
        return
      } else {
        setErrors((e) => ({ ...e, [`stop.${idx}.${field}`]: '' }))
        ;(next[idx] as any)[field] = num
      }
    }
    setLocalStops(next)
    emitChange(localStart, next)
    if (enableDistancePreview) void refreshPreview(localStart, next)
  }

  const addStop = () => {
    if (localStops.length >= maxStops) {
      setWarnings(`MVP limit of ${maxStops} stops reached.`)
      return
    }
    const newStop: RouteStop = { id: `${Date.now()}`, name: `Stop ${localStops.length + 1}`, lat: 0, lng: 0 }
    const next = [...localStops, newStop]
    setLocalStops(next)
    emitChange(localStart, next)
  }

  const removeStop = (idx: number) => {
    const next = localStops.filter((_, i) => i !== idx)
    setLocalStops(next)
    emitChange(localStart, next)
    if (enableDistancePreview) void refreshPreview(localStart, next)
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const next = Array.from(localStops)
    const [removed] = next.splice(result.source.index, 1)
    next.splice(result.destination.index, 0, removed)
    setLocalStops(next)
    emitChange(localStart, next)
    if (enableDistancePreview) void refreshPreview(localStart, next)
  }

  const refreshPreview = async (s: RouteStop, stopsList: RouteStop[]) => {
    try {
      const locations = [s, ...stopsList].map((p) => ({ lat: p.lat, lng: p.lng, name: p.name }))
      const resp = await fetch('http://localhost:8000/distance-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations }),
      })
      if (!resp.ok) return setPreviewKm(null)
      const data = await resp.json()
      const matrix: number[][] = data?.matrix || []
      // Sum along the sequential path in current order
      let total = 0
      for (let i = 0; i < locations.length - 1; i++) {
        total += matrix[i]?.[i + 1] ?? 0
      }
      setPreviewKm(total / 1000)
    } catch {
      setPreviewKm(null)
    }
  }

  return (
    <div className="overlay-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Route Builder</h3>
        {previewKm != null && (
          <span className="text-sm text-gray-600">Preview distance: {previewKm.toFixed(2)} km</span>
        )}
      </div>

      {warnings && (
        <div className="status-warning mb-3">{warnings}</div>
      )}

      <div className="border-b pb-4 mb-4">
        <h4 className="font-medium text-gray-700 mb-3">Start</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <input
              value={localStart.name}
              onChange={(e) => handleStartChange('name', e.target.value)}
              className="input-field"
              placeholder="Start name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Lat</label>
            <input
              defaultValue={localStart.lat}
              onBlur={(e) => handleStartChange('lat', e.target.value)}
              className="input-field"
              placeholder="0.0"
            />
            {errors['start.lat'] && <p className="text-xs text-red-600 mt-1">{errors['start.lat']}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Lng</label>
            <input
              defaultValue={localStart.lng}
              onBlur={(e) => handleStartChange('lng', e.target.value)}
              className="input-field"
              placeholder="0.0"
            />
            {errors['start.lng'] && <p className="text-xs text-red-600 mt-1">{errors['start.lng']}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-700">Stops</h4>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={onOpenSearch} aria-label="Open search modal">Add Stop</button>
          <button className="btn-primary" onClick={addStop} aria-label="Add empty stop">Add Empty</button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="stops">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
              {localStops.map((s, idx) => (
                <Draggable key={s.id} draggableId={s.id} index={idx}>
                  {(drag) => (
                    <div ref={drag.innerRef} {...drag.draggableProps} className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Stop {idx + 1}</span>
                          <span className="hidden sm:inline">•</span>
                          <label className="inline-flex items-center gap-2">
                            <input type="checkbox" checked={!!s.isPriority} onChange={(e) => handleStopChange(idx, 'isPriority', e.target.checked)} />
                            Priority
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-red-600 hover:text-red-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500" onClick={() => removeStop(idx)} aria-label="Remove stop">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          <span {...drag.dragHandleProps} className="cursor-grab p-1 rounded hover:bg-gray-100" aria-label="Drag handle">
                            <Bars3Icon className="h-5 w-5 text-gray-600" />
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input className="input-field" value={s.name} onChange={(e) => handleStopChange(idx, 'name', e.target.value)} placeholder="Name or address" />
                        <div>
                          <input className="input-field" defaultValue={s.lat} onBlur={(e) => handleStopChange(idx, 'lat', e.target.value)} placeholder="Lat" />
                          {errors[`stop.${idx}.lat`] && <p className="text-xs text-red-600 mt-1">{errors[`stop.${idx}.lat`]}</p>}
                        </div>
                        <div>
                          <input className="input-field" defaultValue={s.lng} onBlur={(e) => handleStopChange(idx, 'lng', e.target.value)} placeholder="Lng" />
                          {errors[`stop.${idx}.lng`] && <p className="text-xs text-red-600 mt-1">{errors[`stop.${idx}.lng`]}</p>}
                        </div>
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
    </div>
  )
}
