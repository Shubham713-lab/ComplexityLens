from typing import Dict, Any

def generate_ai_explanation(
    code: str,
    language: str,
    time_o: str,
    space_o: str,
    formula: str
) -> Dict[str, Any]:
    """
    Generate natural language complexity explanations, structural bottleneck callouts,
    and optimization recommendations using the built-in static analysis engine.
    """
    explanation = (
        f"The submitted {language.title()} code exhibits an overall asymptotic time complexity of {time_o} "
        f"and an auxiliary space complexity of {space_o}. The total operation count as a function of input size N is governed by {formula}.\n\n"
    )

    bottlenecks = []
    optimizations = []
    optimized_code = code

    if time_o in ("O(N²)", "O(N³)", "O(N^2)", "O(N^3)"):
        explanation += (
            "The dominant growth factor stems from nested iteration blocks where the inner loop executes multiple times for each outer loop iteration. "
            "For large inputs (N > 10,000), polynomial growth significantly impacts real-time throughput."
        )
        bottlenecks.append(f"Nested loop structure scaling with N ({time_o}).")
        bottlenecks.append("Repeated redundant comparisons across iterations.")

        optimizations.append("Use Hash Map / Hash Set lookup to replace inner loop searches, reducing time complexity from O(N²) to O(N).")
        optimizations.append("Apply Two-Pointer or Sliding Window techniques if searching in ordered arrays.")
        optimizations.append("Leverage divide-and-conquer strategy or dynamic programming memoization.")

        if language == "python":
            optimized_code = (
                "# Optimized implementation using Hash Map (O(N) Time, O(N) Space)\n"
                "def optimized_solution(arr, target):\n"
                "    seen = {}\n"
                "    for idx, num in enumerate(arr):\n"
                "        complement = target - num\n"
                "        if complement in seen:\n"
                "            return [seen[complement], idx]\n"
                "        seen[num] = idx\n"
                "    return []\n"
            )
        elif language == "cpp":
            optimized_code = (
                "// Optimized implementation using std::unordered_map (O(N) Time)\n"
                "#include <unordered_map>\n"
                "#include <vector>\n\n"
                "std::vector<int> optimizedSolution(const std::vector<int>& nums, int target) {\n"
                "    std::unordered_map<int, int> seen;\n"
                "    for (int i = 0; i < nums.size(); ++i) {\n"
                "        int diff = target - nums[i];\n"
                "        if (seen.find(diff) != seen.end()) return {seen[diff], i};\n"
                "        seen[nums[i]] = i;\n"
                "    }\n"
                "    return {};\n"
                "}\n"
            )
        else:  # java
            optimized_code = (
                "// Optimized implementation using HashMap (O(N) Time)\n"
                "import java.util.HashMap;\n"
                "import java.util.Map;\n\n"
                "public class Solution {\n"
                "    public int[] optimizedSolution(int[] nums, int target) {\n"
                "        Map<Integer, Integer> seen = new HashMap<>();\n"
                "        for (int i = 0; i < nums.length; i++) {\n"
                "            int diff = target - nums[i];\n"
                "            if (seen.containsKey(diff)) return new int[]{seen.get(diff), i};\n"
                "            seen.put(nums[i], i);\n"
                "        }\n"
                "        return new int[0];\n"
                "    }\n"
                "}\n"
            )
    elif "2^N" in time_o:
        explanation += (
            "The code contains un-memoized recursive calls branching exponentially (O(2^N)). "
            "Overlapping subproblems are recalculated repeatedly, creating a massive call tree depth."
        )
        bottlenecks.append("Exponential recursive branching factor without state caching.")
        bottlenecks.append("Call stack memory consumption proportional to tree depth O(N).")

        optimizations.append("Add Dynamic Programming memoization (top-down) or iterative tabular approach (bottom-up) to reduce time complexity to O(N).")
        optimizations.append("Use iterative loop to reduce space complexity to O(1).")

        if language == "python":
            optimized_code = (
                "# Optimized using Dynamic Programming / Iteration (O(N) Time, O(1) Space)\n"
                "def fibonacci_optimized(n):\n"
                "    if n <= 1:\n"
                "        return n\n"
                "    a, b = 0, 1\n"
                "    for _ in range(2, n + 1):\n"
                "        a, b = b, a + b\n"
                "    return b\n"
            )
    else:
        explanation += "The code operates efficiently with low algorithmic cost."
        bottlenecks.append("No major structural bottlenecks detected.")
        optimizations.append("Code already adheres to efficient computational complexity boundaries.")

    return {
        "natural_explanation": explanation,
        "bottlenecks": bottlenecks,
        "optimization_suggestions": optimizations,
        "optimized_code": optimized_code,
        "ai_source": "Built-in Analysis Engine"
    }