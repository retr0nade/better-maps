'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import debounce from 'debounce'
import dynamic from 'next/dynamic'

// SSR-safe access to react-leaflet useMap
const useMap = dynamic(async () => (await import('react-leaflet')).useMap, { ssr: false }) as unknown as () => any

type NominatimSuggestion = {
  display_name: string
  lat: string
  lon: string
}

type Props = {
  onAddStop?: (lat: number, lng: number, name: string) => void
  placeholder?: string
}

export default function SearchBox({ onAddStop, placeholder = 'Search places...' }: Props): React.ReactElement {
  const map = (useMap as any)?.() ?? null
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([])
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  const searchPlaces = useMemo(
    () =>
      debounce(async (q: string) => {
        if (!q || q.length < 2) {
          setSuggestions([])
          setActiveIndex(-1)
          setOpen(false)
          return
        }
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=8`
          const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
          if (!res.ok) {
            setSuggestions([])
            setActiveIndex(-1)
            setOpen(false)
            return
          }
          const data: NominatimSuggestion[] = await res.json()
          setSuggestions(data)
          setActiveIndex(data.length ? 0 : -1)
          setOpen(data.length > 0)
        } catch {
          setSuggestions([])
          setActiveIndex(-1)
          setOpen(false)
        }
      }, 300),
    []
  )

  useEffect(() => () => searchPlaces.clear?.(), [searchPlaces])

  const selectSuggestion = (s: NominatimSuggestion) => {
    const lat = parseFloat(s.lat)
    const lng = parseFloat(s.lon)
    if (map?.flyTo) map.flyTo([lat, lng], 14)
    else if (map?.setView) map.setView([lat, lng], 14)
    if (onAddStop) onAddStop(lat, lng, s.display_name)
    setQuery(s.display_name)
    setSuggestions([])
    setActiveIndex(-1)
    setOpen(false)
  }

  return (
    <div className="absolute top-4 left-4 z-40 w-[min(92vw,420px)]">
      <div className="bg-white rounded-full shadow px-4 py-2 flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M21 21l-4.35-4.35" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="10" cy="10" r="7" stroke="#6b7280" strokeWidth="2"/>
        </svg>
        <input
          className="outline-none w-full text-sm"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            const q = e.target.value
            setQuery(q)
            searchPlaces(q)
          }}
          onFocus={() => setOpen(suggestions.length > 0)}
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
              if (activeIndex >= 0) selectSuggestion(suggestions[activeIndex])
            } else if (e.key === 'Escape') {
              setOpen(false)
              setSuggestions([])
              setActiveIndex(-1)
            }
          }}
          aria-label="Search places"
          role="combobox"
          aria-expanded={open}
          aria-controls="searchbox-suggestions"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div
          id="searchbox-suggestions"
          ref={listRef}
          className="mt-2 max-h-64 overflow-auto rounded-md border border-gray-200 bg-white shadow"
          role="listbox"
        >
          {suggestions.map((s, idx) => (
            <button
              key={`${s.lat}-${s.lon}-${idx}`}
              onClick={() => selectSuggestion(s)}
              role="option"
              aria-selected={activeIndex === idx}
              className={`w-full text-left px-3 py-2 text-sm focus:outline-none ${activeIndex === idx ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              {s.display_name}
            </button>
          ))}
          <div className="px-3 py-2 text-xs text-gray-400 border-t">
            Powered by Nominatim. Please respect their <a className="underline" href="https://operations.osmfoundation.org/policies/nominatim/" target="_blank" rel="noreferrer">usage policy</a>.
          </div>
        </div>
      )}
    </div>
  )
}


