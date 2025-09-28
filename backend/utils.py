import requests
import time
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_distance_matrix(locations: List[Dict[str, float]]) -> List[List[float]]:
    """
    Get distance matrix between all locations using OSRM public API.
    
    Args:
        locations: List of coordinate dictionaries with 'lat' and 'lng' keys
        
    Returns:
        2D symmetric distance matrix with distances in meters
        
    Raises:
        ValueError: If locations list is empty or invalid
        requests.RequestException: If API call fails
    """
    if not locations:
        raise ValueError("Locations list cannot be empty")
    
    if len(locations) == 1:
        return [[0.0]]
    
    # Validate input format
    for i, loc in enumerate(locations):
        if not isinstance(loc, dict) or 'lat' not in loc or 'lng' not in loc:
            raise ValueError(f"Invalid location format at index {i}. Expected dict with 'lat' and 'lng' keys")
        if not isinstance(loc['lat'], (int, float)) or not isinstance(loc['lng'], (int, float)):
            raise ValueError(f"Invalid coordinate values at index {i}. Expected numeric values")
    
    n = len(locations)
    distance_matrix = [[0.0 for _ in range(n)] for _ in range(n)]
    
    # Build OSRM coordinates string (longitude,latitude format)
    coordinates = []
    for loc in locations:
        coordinates.append(f"{loc['lng']},{loc['lat']}")
    
    coordinates_str = ";".join(coordinates)
    
    # OSRM table service URL
    url = f"http://router.project-osrm.org/table/v1/driving/{coordinates_str}"
    
    # Add parameters for distance matrix
    params = {
        'sources': ';'.join(str(i) for i in range(n)),
        'destinations': ';'.join(str(i) for i in range(n)),
        'annotations': 'distance'
    }
    
    try:
        logger.info(f"Requesting distance matrix for {n} locations from OSRM")
        
        # Make request with timeout
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        # Check for API errors
        if 'code' in data and data['code'] != 'Ok':
            raise requests.RequestException(f"OSRM API error: {data.get('message', 'Unknown error')}")
        
        # Extract distances from response
        distances = data.get('distances', [])
        
        if not distances or len(distances) != n:
            raise requests.RequestException("Invalid response format from OSRM API")
        
        # Fill the distance matrix
        for i in range(n):
            for j in range(n):
                if i < len(distances) and j < len(distances[i]):
                    distance_matrix[i][j] = float(distances[i][j])
                else:
                    # Fallback: calculate straight-line distance if OSRM data is missing
                    distance_matrix[i][j] = calculate_straight_line_distance(
                        locations[i], locations[j]
                    )
        
        logger.info(f"Successfully retrieved distance matrix for {n} locations")
        return distance_matrix
        
    except requests.exceptions.Timeout:
        logger.error("OSRM API request timed out")
        # Fallback to straight-line distances
        logger.info("Falling back to straight-line distance calculations")
        return calculate_straight_line_matrix(locations)
        
    except requests.exceptions.RequestException as e:
        logger.error(f"OSRM API request failed: {e}")
        # Fallback to straight-line distances
        logger.info("Falling back to straight-line distance calculations")
        return calculate_straight_line_matrix(locations)
        
    except Exception as e:
        logger.error(f"Unexpected error in get_distance_matrix: {e}")
        raise


def calculate_straight_line_distance(loc1: Dict[str, float], loc2: Dict[str, float]) -> float:
    """
    Calculate straight-line distance between two coordinates using Haversine formula.
    
    Args:
        loc1: First location with 'lat' and 'lng' keys
        loc2: Second location with 'lat' and 'lng' keys
        
    Returns:
        Distance in meters
    """
    import math
    
    # Convert to radians
    lat1_rad = math.radians(loc1['lat'])
    lng1_rad = math.radians(loc1['lng'])
    lat2_rad = math.radians(loc2['lat'])
    lng2_rad = math.radians(loc2['lng'])
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlng = lng2_rad - lng1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Earth's radius in meters
    earth_radius = 6371000
    
    return earth_radius * c


def calculate_straight_line_matrix(locations: List[Dict[str, float]]) -> List[List[float]]:
    """
    Calculate straight-line distance matrix as fallback when OSRM is unavailable.
    
    Args:
        locations: List of coordinate dictionaries
        
    Returns:
        2D symmetric distance matrix with distances in meters
    """
    n = len(locations)
    distance_matrix = [[0.0 for _ in range(n)] for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            if i == j:
                distance_matrix[i][j] = 0.0
            else:
                distance_matrix[i][j] = calculate_straight_line_distance(locations[i], locations[j])
    
    return distance_matrix
