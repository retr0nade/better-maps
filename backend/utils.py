import requests
import time
from typing import List, Dict, Any, Tuple, Optional
import logging
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

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


def solve_tsp(distance_matrix: List[List[float]], priority: Optional[List[int]] = None) -> Tuple[List[int], float]:
    """
    Solve Traveling Salesman Problem using OR-Tools.
    
    Args:
        distance_matrix: 2D symmetric distance matrix in meters
        priority: Optional list of node indices to visit first in order
        
    Returns:
        Tuple of (optimized_order, total_distance)
        - optimized_order: List of node indices in optimal visiting order
        - total_distance: Total distance in meters
        
    Raises:
        ValueError: If distance matrix is invalid or priority indices are out of range
    """
    if not distance_matrix:
        raise ValueError("Distance matrix cannot be empty")
    
    n = len(distance_matrix)
    
    # Validate distance matrix
    if n != len(distance_matrix[0]):
        raise ValueError("Distance matrix must be square")
    
    if n < 2:
        return [0], 0.0
    
    # Validate priority list
    if priority is not None:
        if not isinstance(priority, list):
            raise ValueError("Priority must be a list of integers")
        
        # Check for valid indices
        for idx in priority:
            if not isinstance(idx, int) or idx < 0 or idx >= n:
                raise ValueError(f"Invalid priority index: {idx}. Must be between 0 and {n-1}")
        
        # Check for duplicates
        if len(priority) != len(set(priority)):
            raise ValueError("Priority list contains duplicate indices")
        
        # Check if all nodes are in priority (for complete TSP)
        if len(priority) == n:
            # Calculate total distance for the given order
            total_distance = 0.0
            for i in range(len(priority) - 1):
                total_distance += distance_matrix[priority[i]][priority[i + 1]]
            return priority, total_distance
    
    # Create routing index manager
    manager = pywrapcp.RoutingIndexManager(n, 1, 0)  # 1 vehicle, start at node 0
    
    # Create routing model
    routing = pywrapcp.RoutingModel(manager)
    
    # Create distance callback
    def distance_callback(from_index, to_index):
        """Returns the distance between the two nodes."""
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]
    
    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    
    # Define cost of each arc
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    # Add priority constraints if provided
    if priority and len(priority) > 1:
        # Create a sequence constraint for priority nodes
        for i in range(len(priority) - 1):
            current_node = priority[i]
            next_node = priority[i + 1]
            
            # Add constraint: next_node must come immediately after current_node
            routing.AddDisjunction([manager.NodeToIndex(current_node)], 0)
            routing.AddDisjunction([manager.NodeToIndex(next_node)], 0)
            
            # Force the sequence
            routing.solver().Add(
                routing.NextVar(manager.NodeToIndex(current_node)) == 
                manager.NodeToIndex(next_node)
            )
    
    # Set search parameters
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 30  # 30 second time limit
    
    # Solve the problem
    logger.info(f"Solving TSP for {n} nodes with OR-Tools")
    solution = routing.SolveWithParameters(search_parameters)
    
    if not solution:
        raise RuntimeError("No solution found for TSP")
    
    # Extract solution
    optimized_order = []
    total_distance = 0.0
    
    index = routing.Start(0)
    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        optimized_order.append(node)
        previous_index = index
        index = solution.Value(routing.NextVar(index))
        total_distance += routing.GetArcCostForVehicle(previous_index, index, 0)
    
    # Add the last node
    optimized_order.append(manager.IndexToNode(index))
    
    logger.info(f"TSP solved: {len(optimized_order)} nodes, {total_distance:.2f}m total distance")
    
    return optimized_order, total_distance
