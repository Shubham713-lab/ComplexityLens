import math
import time
from typing import Dict, Any, List

def run_empirical_benchmark(time_complexity_o: str, max_n: int = 10000) -> List[Dict[str, Any]]:
    """
    Generate benchmark data points for input size N vs actual step counts / execution time,
    along with normalized theoretical curves (O(1), O(log N), O(N), O(N log N), O(N^2), O(2^N)).
    """
    n_values = [10, 50, 100, 500, 1000, 2500, 5000, 7500, 10000]
    results = []
    
    for n in n_values:
        # Calculate actual simulated steps based on detected time complexity
        if time_complexity_o == "O(1)":
            actual_steps = 1
        elif time_complexity_o == "O(log N)":
            actual_steps = int(math.log2(n)) if n > 0 else 1
        elif time_complexity_o == "O(N)":
            actual_steps = n
        elif time_complexity_o == "O(N log N)":
            actual_steps = int(n * math.log2(n)) if n > 0 else 1
        elif time_complexity_o == "O(N²)":
            actual_steps = n ** 2
        elif time_complexity_o == "O(N³)":
            actual_steps = n ** 3
        elif "2^N" in time_complexity_o:
            # cap for display
            actual_steps = 2 ** min(n, 20)
        else:
            actual_steps = n
            
        # Theoretical comparison curves
        curve_o1 = 1
        curve_logn = math.log2(n) if n > 0 else 1
        curve_on = n
        curve_onlogn = n * math.log2(n) if n > 0 else 1
        curve_on2 = n ** 2
        curve_o2n = 2 ** min(n, 15)
        
        # Simulated duration (microseconds scaled)
        simulated_time_ms = round((actual_steps * 0.00005), 4)
        
        results.append({
            "n": n,
            "actual_steps": actual_steps,
            "simulated_time_ms": simulated_time_ms,
            "O_1": curve_o1,
            "O_logN": round(curve_logn, 2),
            "O_N": curve_on,
            "O_NlogN": round(curve_onlogn, 2),
            "O_N2": curve_on2,
            "O_2N": curve_o2n
        })
        
    return results
