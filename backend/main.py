from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from analyzer.python_analyzer import analyze_python_code
from analyzer.cpp_java_analyzer import analyze_cpp_java_code
from analyzer.execution_benchmark import run_empirical_benchmark
from analyzer.ai_explainer import generate_ai_explanation, chat_with_ai
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

app = FastAPI(title="Real-Time Algorithm Complexity Analyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeAnalysisRequest(BaseModel):
    code: str
    language: str  # python, cpp, java
    api_key: Optional[str] = None

class BenchmarkRequest(BaseModel):
    time_complexity_o: str
    max_n: Optional[int] = 10000
    code: Optional[str] = None
    language: Optional[str] = "python"
    num_trials: Optional[int] = 3

class AIExplainRequest(BaseModel):
    code: str
    language: str
    time_complexity_o: str
    space_complexity: str
    formula: str
    api_key: Optional[str] = None

class ChatRequest(BaseModel):
    code: str
    language: str
    time_complexity_o: Optional[str] = "O(N)"
    space_complexity: Optional[str] = "O(1)"
    formula: Optional[str] = ""
    messages: List[Dict[str, str]]
    api_key: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "Algorithm Complexity Analyzer Backend API Active"}

@app.post("/api/analyze")
def analyze_code(req: CodeAnalysisRequest):
    code = req.code.strip()
    lang = req.language.lower()
    
    if not code:
        raise HTTPException(status_code=400, detail="Code content cannot be empty")
        
    if lang == "python":
        analysis = analyze_python_code(code)
    elif lang in ("cpp", "java", "c++"):
        analysis = analyze_cpp_java_code(code, language=lang)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {lang}")
        
    if not analysis.get("valid", True):
        raise HTTPException(status_code=422, detail=analysis.get("error", "Failed to parse code"))
        
    # Generate default AI/Rule explanation & refinement
    ai_data = generate_ai_explanation(
        code=code,
        language=lang,
        time_o=analysis["time_complexity_o"],
        space_o=analysis["space_complexity"],
        formula=analysis["formula_str"],
        api_key=req.api_key
    )

    # If AI Model verified/refined complexity, update the root metrics and line costs
    if ai_data.get("ai_source") != "Built-in Analysis Engine":
        if "time_complexity_o" in ai_data:
            analysis["time_complexity_o"] = ai_data["time_complexity_o"]
            analysis["time_complexity_omega"] = ai_data.get("time_complexity_omega", ai_data["time_complexity_o"].replace("O(", "Ω("))
            analysis["time_complexity_theta"] = ai_data.get("time_complexity_theta", ai_data["time_complexity_o"].replace("O(", "Θ("))
        if "space_complexity" in ai_data:
            analysis["space_complexity"] = ai_data["space_complexity"]
        if "formula_str" in ai_data:
            analysis["formula_str"] = ai_data["formula_str"]
        if "dominant_term" in ai_data:
            analysis["dominant_term"] = ai_data["dominant_term"]

        # Merge AI-verified line_costs into static line_costs
        if "line_costs" in ai_data and isinstance(ai_data["line_costs"], dict):
            for l_str, info in ai_data["line_costs"].items():
                try:
                    l_num = int(l_str)
                    if l_num in analysis.get("line_costs", {}):
                        if isinstance(info, dict):
                            if "cost" in info:
                                analysis["line_costs"][l_num]["cost"] = info["cost"]
                            if "frequency" in info:
                                analysis["line_costs"][l_num]["frequency"] = info["frequency"]
                        elif isinstance(info, str):
                            analysis["line_costs"][l_num]["cost"] = info
                except (ValueError, TypeError):
                    pass

            # Synchronize AST graph nodes with AI line costs
            if "graph" in analysis and "nodes" in analysis["graph"]:
                for node in analysis["graph"]["nodes"]:
                    line_no = node.get("data", {}).get("line")
                    if line_no and line_no in analysis["line_costs"]:
                        ai_cost = analysis["line_costs"][line_no]["cost"]
                        node["data"]["cost"] = ai_cost
                        if "Loop" in node.get("data", {}).get("label", ""):
                            node["data"]["label"] = f"Loop ({ai_cost})"

    # Generate benchmark dataset using finalized time complexity
    benchmark_res = run_empirical_benchmark(
        time_complexity_o=analysis.get("time_complexity_o", "O(N)"),
        max_n=10000,
        code=code,
        language=lang,
        num_trials=1
    )
    analysis["benchmark_data"] = benchmark_res["benchmark_data"]
    analysis["is_live_execution"] = benchmark_res["is_live_execution"]
    analysis["curve_fit"] = benchmark_res["curve_fit"]
    analysis["ai_explanation"] = ai_data
    
    return analysis

@app.post("/api/benchmark")
def get_benchmark(req: BenchmarkRequest):
    benchmark_res = run_empirical_benchmark(
        time_complexity_o=req.time_complexity_o,
        max_n=req.max_n or 10000,
        code=req.code,
        language=req.language or "python",
        num_trials=req.num_trials or 3
    )
    return benchmark_res

@app.post("/api/ai-explain")
def get_ai_explanation(req: AIExplainRequest):
    ai_res = generate_ai_explanation(
        code=req.code,
        language=req.language,
        time_o=req.time_complexity_o,
        space_o=req.space_complexity,
        formula=req.formula
    )
    return ai_res

@app.post("/api/chat")
def chat_algorithm(req: ChatRequest):
    reply = chat_with_ai(
        code=req.code,
        language=req.language,
        time_o=req.time_complexity_o or "O(N)",
        space_o=req.space_complexity or "O(1)",
        formula=req.formula or "",
        messages=req.messages,
        api_key=req.api_key
    )
    return {"reply": reply}

@app.get("/api/presets")
def get_code_presets():
    return {
        "python": [
            {
                "name": "Two Sum (Nested Loop O(N²))",
                "code": """def two_sum(nums, target):\n    n = len(nums)\n    for i in range(n):\n        for j in range(i + 1, n):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []"""
            },
            {
                "name": "Merge Sort (O(N log N))",
                "code": """def merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left_half = merge_sort(arr[:mid])\n    right_half = merge_sort(arr[mid:])\n    return merge(left_half, right_half)\n\ndef merge(left, right):\n    sorted_arr = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            sorted_arr.append(left[i])\n            i += 1\n        else:\n            sorted_arr.append(right[j])\n            j += 1\n    sorted_arr.extend(left[i:])\n    sorted_arr.extend(right[j:])\n    return sorted_arr"""
            },
            {
                "name": "Binary Search (O(log N))",
                "code": """def binary_search(arr, target):\n    low = 0\n    high = len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1"""
            },
            {
                "name": "Matrix Multiplication (O(N³))",
                "code": """def multiply_matrices(A, B, n):\n    result = [[0]*n for _ in range(n)]\n    for i in range(n):\n        for j in range(n):\n            for k in range(n):\n                result[i][j] += A[i][k] * B[k][j]\n    return result"""
            },
            {
                "name": "Fibonacci Recursive (O(2^N))",
                "code": """def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)"""
            },
            {
                "name": "Bubble Sort (O(N²))",
                "code": """def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr"""
            }
        ],
        "cpp": [
            {
                "name": "Nested Loop Two Sum (O(N²))",
                "code": """#include <vector>\n\nstd::vector<int> twoSum(std::vector<int>& nums, int target) {\n    int n = nums.size();\n    for (int i = 0; i < n; i++) {\n        for (int j = i + 1; j < n; j++) {\n            if (nums[i] + nums[j] == target) {\n                return {i, j};\n            }\n        }\n    }\n    return {};\n}"""
            },
            {
                "name": "Binary Loop (O(log N))",
                "code": """int bitwiseDivide(int n) {\n    int steps = 0;\n    while (n > 0) {\n        n /= 2;\n        steps++;\n    }\n    return steps;\n}"""
            }
        ],
        "java": [
            {
                "name": "Nested Loop (O(N²))",
                "code": """public class ComplexityDemo {\n    public static void printPairs(int[] arr) {\n        int n = arr.length;\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                System.out.println(arr[i] + ", " + arr[j]);\n            }\n        }\n    }\n}"""
            }
        ]
    }
