from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from .utils import get_distance_matrix, solve_tsp

router = APIRouter()

class Location(BaseModel):
    lat: float
    lng: float

class DistanceMatrixRequest(BaseModel):
    locations: List[Location]

class DistanceMatrixResponse(BaseModel):
    matrix: List[List[float]]

class OptimizeRouteRequest(BaseModel):
    distance_matrix: List[List[float]]
    priority: Optional[List[int]] = None

class OptimizeRouteResponse(BaseModel):
    order: List[int]
    total_distance: float

@router.post("/distance-matrix", response_model=DistanceMatrixResponse)
async def calculate_distance_matrix(request: DistanceMatrixRequest):
    """
    Calculate distance matrix between all provided locations.
    
    Args:
        request: JSON with locations list containing lat/lng coordinates
        
    Returns:
        JSON with 2D distance matrix in meters
        
    Raises:
        HTTPException: If input validation fails or distance calculation fails
    """
    try:
        # Convert Pydantic models to dictionaries
        locations = [{"lat": loc.lat, "lng": loc.lng} for loc in request.locations]
        
        # Get distance matrix using utility function
        matrix = get_distance_matrix(locations)
        
        return DistanceMatrixResponse(matrix=matrix)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate distance matrix: {str(e)}")

@router.post("/optimize-route", response_model=OptimizeRouteResponse)
async def optimize_route(request: OptimizeRouteRequest):
    """
    Optimize route using TSP solver.
    
    Args:
        request: JSON with distance matrix and optional priority list
        
    Returns:
        JSON with optimized order and total distance
        
    Raises:
        HTTPException: If optimization fails
    """
    try:
        # Solve TSP using utility function
        order, total_distance = solve_tsp(request.distance_matrix, request.priority)
        
        return OptimizeRouteResponse(order=order, total_distance=total_distance)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to optimize route: {str(e)}")
