import pytest
from analyzer.python_analyzer import analyze_python_code
from analyzer.cpp_java_analyzer import analyze_cpp_java_code
from analyzer.sympy_solver import solve_loop_complexity
from analyzer.execution_benchmark import run_empirical_benchmark

def test_sympy_constant():
    res = solve_loop_complexity([])
    assert res["time_complexity_o"] == "O(1)"

def test_sympy_nested_quadratic():
    bounds = [
        {"var": "i", "start": "1", "end": "N", "step_type": "linear"},
        {"var": "j", "start": "1", "end": "N", "step_type": "linear"}
    ]
    res = solve_loop_complexity(bounds)
    assert res["time_complexity_o"] == "O(N²)"

def test_python_two_sum():
    code = """def two_sum(nums, target):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []"""
    res = analyze_python_code(code)
    assert res["valid"] is True
    assert res["time_complexity_o"] == "O(N²)"

def test_python_binary_search():
    code = """def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1"""
    res = analyze_python_code(code)
    assert res["valid"] is True
    assert res["time_complexity_o"] == "O(log N)"

def test_python_fibonacci_recursion():
    code = """def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)"""
    res = analyze_python_code(code)
    assert res["valid"] is True
    assert res["has_recursion"] is True
    assert "2^N" in res["time_complexity_o"]

def test_python_fibonacci_memoized():
    code = """memo = {}
def fib(n):
    if n <= 1:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n-1) + fib(n-2)
    return memo[n]"""
    res = analyze_python_code(code)
    assert res["valid"] is True
    assert res["is_memoized"] is True
    assert res["time_complexity_o"] == "O(N)"

def test_python_merge_sort_recursion():
    code = """def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left_half = merge_sort(arr[:mid])
    right_half = merge_sort(arr[mid:])
    return merge(left_half, right_half)"""
    res = analyze_python_code(code)
    assert res["valid"] is True
    assert res["is_divide_and_conquer"] is True
    assert res["time_complexity_o"] == "O(N log N)"

def test_python_quick_sort_recursion():
    code = """def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)"""
    res = analyze_python_code(code)
    assert res["valid"] is True
    assert res["is_divide_and_conquer"] is True
    assert res["time_complexity_o"] == "O(N log N)"

def test_python_coin_change_dp():
    code = """def min_coins(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    if dp[amount] == float('inf'):
        return -1
    return dp[amount]"""
    res = analyze_python_code(code)
    assert res["valid"] is True
    assert res["time_complexity_o"] in ("O(N · M)", "O(M · N)")
    assert res["space_complexity"] == "O(N)"

def test_cpp_nested_loops():
    code = """void process(int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            int val = i * j;
        }
    }
}"""
    res = analyze_cpp_java_code(code, "cpp")
    assert res["valid"] is True
    assert res["time_complexity_o"] == "O(N²)"
