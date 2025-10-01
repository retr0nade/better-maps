## Developer Notes

- Frontend → Backend optimization
  - The planner posts to FastAPI endpoint `POST http://127.0.0.1:8000/optimize-route` with payload:
    - `{ locations: [{ lat, lng }...], priority: number[] }`
  - Backend responds with:
    - `{ optimized_order: number[], total_distance_m: number }`

- OSRM route geometry fetch
  - After receiving `optimized_order`, the frontend orders the points and builds a coordinates string `lng,lat` joined by `;`.
  - It then calls OSRM:
    - `http://router.project-osrm.org/route/v1/driving/{coords}?overview=full&geometries=geojson&steps=false`
  - The returned GeoJSON `geometry` is rendered as a polyline on the Leaflet map.
  - Production: replace the public OSRM service with a self-hosted instance or add robust rate-limit/backoff handling.

- Place suggestions (Nominatim)
  - Autocomplete uses Nominatim search API with a custom `User-Agent`.
  - Respect Nominatim usage policy and add debounce (300 ms) to reduce load.
  - For scale/production, add a paid/hosted geocoding provider or self-host Nominatim.

- CORS
  - Ensure the FastAPI backend allows the frontend origin in CORS settings when running in different hosts/ports.


