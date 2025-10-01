## Pre-Launch Checklist

- Mobile responsiveness verified across breakpoints (sm, md, lg, xl)
  - Navbar collapses to hamburger; drawer behaves as bottom sheet on mobile
  - Hero, planner overlays, and FABs remain usable on small screens

- Map behavior
  - Map fills available viewport (`.fullmap`), including true fullscreen mode
  - Escape exits fullscreen; toolbar available in fullscreen
  - Marker drag/reorder works with touch and mouse

- Geolocation UX
  - Permission requested gracefully on mount
  - If denied/unavailable, non-blocking fallback text shown and app remains usable

- Network calls
  - All fetch/axios calls have timeouts or error handling with user-visible states
  - Debounce (≥300ms) applied to Nominatim queries and distance preview
  - Friendly rate-limit messages for Nominatim/OSRM (suggest try again/self-host)

- Accessibility
  - ARIA roles for search combobox/listbox/options
  - Keyboard navigation (ArrowUp/Down, Enter, Escape) for suggestions
  - Focus styles visible and drag handles keyboard-focusable

- Data management
  - Save/Load routes via localStorage; JSON export and share link copy working
  - Warning banner for >12 stops with guidance

- Optional integrations
  - Analytics snippet added/configured (if desired)
  - Error reporting hook enabled (e.g., Sentry capture on fetch failures)

- Backend coordination
  - CORS allows frontend origin
  - `/optimize-route` returns `{ optimized_order, total_distance_m }`
  - `/feedback` stores and returns recent items


