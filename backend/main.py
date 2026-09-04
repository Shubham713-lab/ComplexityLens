from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from analyzer.python_analyzer import analyze_python_code
from analyzer.cpp_java_analyzer import analyze_cpp_java_code
from analyzer.execution_benchmark import run_empirical_benchmark
from analyzer.ai_explainer import generate_ai_explanation
from dotenv import load_dotenv; load_dotenv()

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
        
    # Generate benchmark dataset
    benchmark_res = run_empirical_benchmark(
        time_complexity_o=analysis.get("time_complexity_o", "O(N)"),
        max_n=10000,
        code=code,
        language=lang,
        num_trials=3
    )
    analysis["benchmark_data"] = benchmark_res["benchmark_data"]
    analysis["is_live_execution"] = benchmark_res["is_live_execution"]
    analysis["curve_fit"] = benchmark_res["curve_fit"]
    
    # Generate default AI/Rule explanation
    ai_data = generate_ai_explanation(
        code=code,
        language=lang,
        time_o=analysis["time_complexity_o"],
        space_o=analysis["space_complexity"],
        formula=analysis["formula_str"]
    )
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
        formula=req.formula,
        api_key=req.api_key
    )
    return ai_res

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
