import math
import time
import ast
import statistics
import subprocess
import tempfile
import os
import json as _json
from typing import Dict, Any, List, Optional


def _generate_mock_args(fn_name: str, fn_args: List[str], n: int, time_complexity_o: str) -> List[Any]:
    """Generate dynamic input parameters for standard algorithm signatures based on size N."""
    # Safety cap for O(2^N) or O(N^3) algorithms
    effective_n = n
    if "2^N" in time_complexity_o:
        effective_n = min(n, 20)
    elif "N³" in time_complexity_o:
        effective_n = min(n, 200)
    elif "N²" in time_complexity_o:
        effective_n = min(n, 2500)

    args = []
    for arg in fn_args:
        arg_lower = arg.lower()
        if arg_lower in ('arr', 'nums', 'list_a', 'data', 'a', 'b', 'vector'):
            # Generate reverse-sorted or sorted array of size N
            args.append(list(range(effective_n, 0, -1)))
        elif arg_lower in ('target', 'val', 'k', 'key', 'x'):
            args.append(effective_n // 2)
        elif arg_lower in ('n', 'size', 'length', 'num'):
            args.append(effective_n)
        else:
            args.append(list(range(effective_n)))
    return args


def _calculate_r2_score(y_measured: List[float], f_theoretical: List[float]) -> float:
    """Calculate Coefficient of Determination (R²) between empirical timing and theoretical curve."""
    if len(y_measured) < 2:
        return 0.0
    mean_y = sum(y_measured) / len(y_measured)
    ss_tot = sum((y - mean_y) ** 2 for y in y_measured)
    if ss_tot == 0:
        return 1.0

    # Scale c * f(n) to best match y
    denom = sum(f ** 2 for f in f_theoretical)
    if denom == 0:
        return 0.0
    c = sum(y * f for y, f in zip(y_measured, f_theoretical)) / denom

    ss_res = sum((y - c * f) ** 2 for y, f in zip(y_measured, f_theoretical))
    r2 = 1.0 - (ss_res / ss_tot)
    return max(0.0, min(1.0, r2))


def _run_in_subprocess(code: str, func_name: str, args: list, timeout_seconds: int = 5) -> Optional[float]:
    """
    Runs the user's function in a separate process with a hard timeout,
    instead of exec()-ing it directly in the backend process. This prevents
    a malicious or buggy submission (e.g. an infinite loop) from hanging
    the backend server indefinitely, since the old exec()-based approach
    had no timeout or process isolation at all.

    Returns elapsed time in ms, or None if it failed/timed out.
    """
    wrapper = f"""
import time, json, sys
{code}

args = json.loads(sys.argv[1])
start = time.perf_counter_ns()
try:
    {func_name}(*args)
except Exception:
    pass
end = time.perf_counter_ns()
print((end - start) / 1e6)
"""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(wrapper)
        temp_path = f.name

    try:
        result = subprocess.run(
            ["python", temp_path, _json.dumps(args)],
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
        )
        if result.returncode == 0:
            return float(result.stdout.strip())
        return None
    except (subprocess.TimeoutExpired, ValueError):
        return None
    finally:
        os.remove(temp_path)


def run_empirical_benchmark(
    time_complexity_o: str = "O(N)",
    max_n: int = 10000,
    code: Optional[str] = None,
    language: str = "python",
    num_trials: int = 3
) -> Dict[str, Any]:
    """
    Executes real empirical code timing (if Python code provided, via an
    isolated timed subprocess) or simulates empirical steps, measures
    execution duration across varying N, and computes theoretical R² curve
    fit score.
    """
    # Dynamic grid of N up to max_n
    step_ratios = [0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 1.0]
    n_values = sorted(list(set([max(5, int(max_n * r)) for r in step_ratios])))

    measured_times_ms: List[float] = []
    actual_steps_list: List[int] = []
    is_live_run = False

    # Attempt live execution if Python code is provided
    if code and language.lower() == "python":
        try:
            parsed = ast.parse(code)
            func_name = None
            for node in ast.walk(parsed):
                if isinstance(node, ast.FunctionDef) and not node.name.startswith('_'):
                    func_name = node.name
                    break

            if func_name:
                fn_args = [arg.arg for arg in parsed.body[0].args.args] if hasattr(parsed.body[0], 'args') else []
                for n in n_values:
                    trial_times = []
                    for _ in range(num_trials):
                        args = _generate_mock_args(func_name, fn_args, n, time_complexity_o)
                        elapsed_ms = _run_in_subprocess(code, func_name, args, timeout_seconds=5)
                        if elapsed_ms is not None:
                            trial_times.append(elapsed_ms)
                    if trial_times:
                        measured_times_ms.append(round(statistics.median(trial_times), 4))
                        is_live_run = True
                    else:
                        break
        except Exception:
            is_live_run = False

    results = []
    theory_o1 = []
    theory_logn = []
    theory_on = []
    theory_onlogn = []
    theory_on2 = []
    theory_o2n = []

    for idx, n in enumerate(n_values):
        # Calculated theoretical steps
        if time_complexity_o == "O(1)":
            steps = 1
        elif time_complexity_o == "O(log N)":
            steps = int(math.log2(n)) if n > 0 else 1
        elif time_complexity_o == "O(N)":
            steps = n
        elif time_complexity_o == "O(N log N)":
            steps = int(n * math.log2(n)) if n > 0 else 1
        elif time_complexity_o == "O(N²)":
            steps = n ** 2
        elif time_complexity_o == "O(N³)":
            steps = n ** 3
        elif "2^N" in time_complexity_o:
            steps = 2 ** min(n, 20)
        else:
            steps = n

        actual_steps_list.append(steps)

        # Theoretical reference values
        c_o1 = 1.0
        c_logn = math.log2(n) if n > 0 else 1.0
        c_on = float(n)
        c_onlogn = n * math.log2(n) if n > 0 else 1.0
        c_on2 = float(n ** 2)
        c_o2n = float(2 ** min(n, 15))

        theory_o1.append(c_o1)
        theory_logn.append(c_logn)
        theory_on.append(c_on)
        theory_onlogn.append(c_onlogn)
        theory_on2.append(c_on2)
        theory_o2n.append(c_o2n)

        # Fallback simulation timing if live run didn't execute
        if not is_live_run or idx >= len(measured_times_ms):
            emp_ms = round(steps * 0.00004 + (0.001 * (idx % 3)), 4)
            measured_times_ms.append(emp_ms) if idx >= len(measured_times_ms) else None
        else:
            emp_ms = measured_times_ms[idx]

        results.append({
            "n": n,
            "actual_steps": steps,
            "measured_time_ms": emp_ms,
            "O_1": round(c_o1, 2),
            "O_logN": round(c_logn, 2),
            "O_N": round(c_on, 2),
            "O_NlogN": round(c_onlogn, 2),
            "O_N2": round(c_on2, 2),
            "O_2N": round(c_o2n, 2)
        })

    # Evaluate R² Fit across candidates
    r2_scores = {
        "O(1)": _calculate_r2_score(measured_times_ms, theory_o1),
        "O(log N)": _calculate_r2_score(measured_times_ms, theory_logn),
        "O(N)": _calculate_r2_score(measured_times_ms, theory_on),
        "O(N log N)": _calculate_r2_score(measured_times_ms, theory_onlogn),
        "O(N²)": _calculate_r2_score(measured_times_ms, theory_on2),
    }

    best_fit = max(r2_scores, key=r2_scores.get)
    fit_score = r2_scores[best_fit]

    return {
        "benchmark_data": results,
        "is_live_execution": is_live_run,
        "curve_fit": {
            "best_fit_complexity": best_fit,
            "r2_score": round(fit_score, 4),
            "fit_percentage": round(fit_score * 100, 1),
            "all_scores": {k: round(v, 4) for k, v in r2_scores.items()}
        }
    }