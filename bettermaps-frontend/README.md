# Better Maps Frontend

A modern Next.js frontend for the Better Maps route optimization application. Built with TypeScript, Tailwind CSS, and React Leaflet for interactive map visualization.

## Features

- 🗺️ **Interactive Maps**: Leaflet.js integration with custom markers and route visualization
- ⚡ **Route Planning**: Intuitive form for adding multiple stops and start location
- 📊 **Distance Analysis**: Real-time distance matrix calculations and optimization
- 🎯 **Route Optimization**: Visual representation of optimized routes with different colored markers
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🚀 **Modern Stack**: Next.js 15, TypeScript, and React 18

## Project Structure

```
bettermaps-frontend/
├── pages/
│   ├── index.tsx          # Landing page with features overview
│   └── planner.tsx        # Route planning interface
├── components/
│   ├── Navbar.tsx         # Navigation component
│   ├── Footer.tsx         # Footer component
│   ├── RouteForm.tsx      # Input form for stops and locations
│   ├── MapView.tsx        # Map container wrapper
│   ├── MapComponent.tsx   # Leaflet map implementation
│   └── DistanceTable.tsx  # Distance matrix table display
├── styles/
│   └── globals.css        # Custom styles and Tailwind utilities
└── src/app/               # Next.js App Router files
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:8000

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   Visit http://localhost:3000

## Usage

### Route Planning

1. **Navigate to Route Planner**: Click "Start Planning Routes" or go to `/planner`

2. **Add Locations**:
   - Enter start location coordinates and name
   - Add multiple stops with coordinates
   - Use "Add Stop" button to add more locations

3. **Calculate Distance Matrix**:
   - Click "Compute Distance Matrix" to calculate distances between all locations
   - View the distance table showing distances between all points

4. **Optimize Route**:
   - Click "Compute Route" to find the optimal visiting order
   - View the optimized route with total distance
   - See the route sequence and efficiency improvements

5. **Export to Google Maps**:
   - Click "Open in Google Maps" to view the route in Google Maps
   - Get turn-by-turn directions for the optimized route

### Map Features

- **Interactive Map**: Zoom, pan, and interact with the map
- **Custom Markers**: 
  - Green marker for start location
  - Red markers for stops
  - Blue marker for end location
- **Route Visualization**: Colored polyline showing the optimized route
- **Location Popups**: Click markers to see location details

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Leaflet**: React components for Leaflet maps
- **Leaflet**: Interactive maps library

### Key Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "next": "^15.0.3",
  "typescript": "^5.6.3",
  "tailwindcss": "^3.4.15",
  "react-leaflet": "^4.2.1",
  "leaflet": "^1.9.4",
  "@types/leaflet": "^1.9.12"
}
```

## API Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000`:

- **POST /distance-matrix**: Calculate distance matrix between locations
- **POST /optimize-route**: Optimize route using TSP solver

### Example API Usage

```typescript
// Calculate distance matrix
const response = await fetch('http://localhost:8000/distance-matrix', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ locations })
});

// Optimize route
const response = await fetch('http://localhost:8000/optimize-route', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    distance_matrix: matrix,
    priority: [0]
  })
});
```

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Code Structure

- **Pages**: Next.js pages using the Pages Router
- **Components**: Reusable React components with TypeScript
- **Styles**: Custom CSS with Tailwind utilities
- **Types**: TypeScript interfaces for type safety

### Customization

- **Styling**: Modify `styles/globals.css` for custom styles
- **Components**: Update components in the `components/` directory
- **Pages**: Modify pages in the `pages/` directory
- **Map**: Customize map behavior in `MapComponent.tsx`

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables

Create a `.env.local` file for environment-specific settings:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Troubleshooting

### Common Issues

1. **Map not loading**: Ensure Leaflet CSS is properly imported
2. **API connection errors**: Check that backend is running on port 8000
3. **TypeScript errors**: Run `npm run lint` to check for type issues
4. **Build errors**: Clear Next.js cache with `rm -rf .next`

### Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.