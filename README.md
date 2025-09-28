# Better Maps

A multi-stop route optimization application with a FastAPI backend and Next.js frontend. Uses OR-Tools for TSP optimization and OSRM for real-world distance calculations.

## Features

- 🗺️ **Interactive Maps**: Leaflet.js integration for route visualization
- ⚡ **Smart Optimization**: OR-Tools TSP solver for optimal route planning
- 📊 **Distance Analysis**: Real-time distance matrix calculations using OSRM
- 💾 **Route Persistence**: Save and load routes with localStorage
- 🚀 **Google Maps Integration**: Export optimized routes to Google Maps
- 🎯 **Priority Support**: Force specific stops to be visited first

## Project Structure

```
bettermaps/
├── main.py              # FastAPI application entry point
├── backend/
│   ├── routes.py        # API endpoints
│   ├── models.py        # Pydantic models
│   └── utils.py         # Distance matrix and TSP utilities
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx     # Home page
│   │   └── plan-route/
│   │       └── page.tsx # Route planning interface
│   └── package.json
├── requirements.txt     # Python dependencies
└── README.md
```

## Backend Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment**:
   ```bash
   # Linux/Mac
   source venv/bin/activate
   
   # Windows
   venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the server**:
   ```bash
   uvicorn main:app --reload
   ```

5. **Verify installation**:
   Visit http://localhost:8000 to see `{"message": "Route Optimizer API running"}`

### API Endpoints

#### GET /
- **Description**: Health check endpoint
- **Response**: `{"message": "Route Optimizer API running"}`

#### POST /distance-matrix
- **Description**: Calculate distance matrix between locations
- **Request Body**:
  ```json
  {
    "locations": [
      {"lat": 40.7128, "lng": -74.0060},
      {"lat": 34.0522, "lng": -118.2437}
    ]
  }
  ```
- **Response**:
  ```json
  {
    "matrix": [
      [0.0, 3944000.0],
      [3944000.0, 0.0]
    ]
  }
  ```

#### POST /optimize-route
- **Description**: Optimize route using TSP solver
- **Request Body**:
  ```json
  {
    "distance_matrix": [[0, 1000, 2000], [1000, 0, 1500], [2000, 1500, 0]],
    "priority": [0]
  }
  ```
- **Response**:
  ```json
  {
    "order": [0, 1, 2],
    "total_distance": 2500.0
  }
  ```

## Frontend Setup

### Prerequisites
- Node.js 18+
- npm

### Installation

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Visit http://localhost:3000

## Usage

### Route Planning

1. **Open the application**: Navigate to http://localhost:3000/plan-route

2. **Add locations**:
   - Enter start location coordinates and name
   - Add multiple stops with coordinates
   - Use "Add Stop" button to add more locations

3. **Compute distance matrix**:
   - Click "Compute Distance Matrix" to calculate distances between all locations
   - View the distance table showing distances from start to each stop

4. **Optimize route**:
   - Click "Compute Route" to find the optimal visiting order
   - View the optimized route with total distance

5. **Export to Google Maps**:
   - Click "Open in Google Maps" to view the route in Google Maps
   - Get turn-by-turn directions for the optimized route

6. **Save routes**:
   - Click "Save Route" after optimization
   - Enter a name for the route
   - Load saved routes from the dropdown or saved routes list

### Testing with Postman

1. **Test distance matrix endpoint**:
   ```
   POST http://localhost:8000/distance-matrix
   Content-Type: application/json
   
   {
     "locations": [
       {"lat": 40.7128, "lng": -74.0060},
       {"lat": 34.0522, "lng": -118.2437},
       {"lat": 41.8781, "lng": -87.6298}
     ]
   }
   ```

2. **Test route optimization**:
   ```
   POST http://localhost:8000/optimize-route
   Content-Type: application/json
   
   {
     "distance_matrix": [
       [0, 3944000, 1262000],
       [3944000, 0, 2800000],
       [1262000, 2800000, 0]
     ],
     "priority": [0]
   }
   ```

## Dependencies

### Backend
- **FastAPI**: Modern web framework for building APIs
- **uvicorn**: ASGI server for FastAPI
- **requests**: HTTP library for OSRM API calls
- **ortools**: Google's optimization tools for TSP solving
- **pydantic**: Data validation using Python type annotations

### Frontend
- **Next.js**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Leaflet**: Interactive maps library
- **react-leaflet**: React components for Leaflet

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

## Troubleshooting

### Backend Issues
- **Import errors**: Ensure virtual environment is activated and dependencies are installed
- **OSRM API errors**: Check internet connection and OSRM service availability
- **OR-Tools errors**: Verify ortools installation with `pip show ortools`

### Frontend Issues
- **Map not loading**: Check browser console for Leaflet CSS/JS loading errors
- **API connection errors**: Ensure backend is running on port 8000
- **Build errors**: Clear Next.js cache with `rm -rf .next` and restart

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
