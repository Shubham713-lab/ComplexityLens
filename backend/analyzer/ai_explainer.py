import os
import json
import re
import ast
from typing import Dict, Any, List, Tuple


def _parse_code_to_steps(code: str, language: str, time_o: str, space_o: str, formula: str) -> Dict[str, Any]:
    """
    Parses input code line-by-line and structurally to generate a rich, 
    code-aware step-by-step mathematical breakdown for code of ANY length,
    mapping line numbers, code snippets, loop depth, and execution costs.
    """
    lines = code.splitlines()
    total_lines = len(lines)
    
    line_costs = {}
    steps = []
    bottlenecks = []
    optimizations = []
    
    # 1. Parse non-empty, non-comment lines
    valid_lines: List[Tuple[int, str, str]] = []
    for idx, raw in enumerate(lines, start=1):
        stripped = raw.strip()
        if not stripped:
            line_costs[str(idx)] = {"cost": "O(0)", "frequency": "Whitespace"}
            continue
        if stripped.startswith("#") or stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
            line_costs[str(idx)] = {"cost": "O(0)", "frequency": "Comment"}
            continue
        valid_lines.append((idx, raw, stripped))

    # 2. Categorize structural lines
    fn_lines = []
    init_lines = []
    loop_blocks = []  # list of dicts: {line, text, depth, indent}
    cond_lines = []
    op_lines = []
    return_lines = []
    recursive_call_lines = []

    # Track loop depth based on indentation or braces
    loop_depth_stack = []
    
    for idx, raw_line, line_str in valid_lines:
        indent = len(raw_line) - len(raw_line.lstrip())
        
        # Check function def / signature
        is_fn = (
            line_str.startswith("def ") or
            line_str.startswith("function ") or
            re.match(r'^(public|private|protected|static|inline|template|\w+)\s+[\w:<>]+\s*\(', line_str) or
            ("main(" in line_str and "int " in line_str)
        )
        if is_fn:
            fn_lines.append((idx, line_str))
            line_costs[str(idx)] = {"cost": "O(1)", "frequency": "Executed 1 time (Function entry)"}
            continue

        # Check return statement
        if line_str.startswith("return ") or line_str == "return;" or line_str.startswith("return("):
            return_lines.append((idx, line_str))
            line_costs[str(idx)] = {"cost": "O(1)", "frequency": "Executed 1 time (Return result)"}
            continue

        # Check loops
        is_loop = (
            line_str.startswith("for ") or line_str.startswith("for(") or
            line_str.startswith("while ") or line_str.startswith("while(") or
            "for (" in line_str or "while (" in line_str
        )
        if is_loop:
            # Adjust loop stack depth based on indentation or nesting
            while loop_depth_stack and loop_depth_stack[-1]["indent"] >= indent:
                loop_depth_stack.pop()
            
            depth = len(loop_depth_stack) + 1
            loop_info = {
                "line": idx,
                "text": line_str,
                "depth": depth,
                "indent": indent
            }
            loop_depth_stack.append(loop_info)
            loop_blocks.append(loop_info)

            cost_str = "O(N)" if depth == 1 else (f"O(N^{depth})" if depth > 2 else "O(N²)")
            if "log" in time_o.lower() and depth == 1:
                cost_str = "O(log N)"
            freq_str = f"Executed N times" if depth == 1 else (f"Executed N^{depth} times" if depth > 2 else "Executed N × N times")
            line_costs[str(idx)] = {"cost": cost_str, "frequency": freq_str}
            continue

        # Maintain loop depth stack for body statements
        while loop_depth_stack and loop_depth_stack[-1]["indent"] >= indent and not line_str.startswith("}"):
            loop_depth_stack.pop()
        current_depth = len(loop_depth_stack)

        # Check recursive calls
        if fn_lines:
            fn_name = fn_lines[0][1].split("(")[0].replace("def ", "").replace("function ", "").strip().split()[-1]
            if fn_name and fn_name in line_str and not line_str.startswith("def "):
                recursive_call_lines.append((idx, line_str, current_depth))
                cost_str = time_o
                line_costs[str(idx)] = {"cost": cost_str, "frequency": "Recursive sub-problem invocation"}
                continue

        # Check conditions
        if (
            line_str.startswith("if ") or line_str.startswith("if(") or
            line_str.startswith("else if") or line_str.startswith("elif ") or
            line_str.startswith("else:") or line_str == "else {"
        ):
            cond_lines.append((idx, line_str, current_depth))
            cost_str = "O(1)" if current_depth == 0 else ("O(N)" if current_depth == 1 else f"O(N^{current_depth})")
            line_costs[str(idx)] = {"cost": cost_str, "frequency": f"Conditional check (depth {current_depth})"}
            continue

        # Categorize initialization vs in-loop body operations
        if current_depth == 0:
            init_lines.append((idx, line_str))
            line_costs[str(idx)] = {"cost": "O(1)", "frequency": "Executed 1 time (State setup)"}
        else:
            op_lines.append((idx, line_str, current_depth))
            cost_str = "O(N)" if current_depth == 1 else (f"O(N^{current_depth})" if current_depth > 2 else "O(N²)")
            line_costs[str(idx)] = {"cost": cost_str, "frequency": f"Executed inside depth-{current_depth} loop body"}

    # Ensure all lines are mapped in line_costs
    for i in range(1, total_lines + 1):
        if str(i) not in line_costs:
            line_costs[str(i)] = {"cost": "O(1)", "frequency": "Executed 1 time"}

    # 3. Construct detailed Step-by-Step execution breakdown cards
    step_num = 1

    # Step 1: Function / Scope Declaration
    if fn_lines:
        f_idx, f_text = fn_lines[0]
        steps.append({
            "step_title": f"Function Signature & Parameter Stack Setup",
            "line_ref": f"Line {f_idx}",
            "complexity": "O(1)",
            "explanation": f"Defines entry point `{f_text}`. Allocates function call frame header and initializes parameter references on execution stack in constant time $O(1)$."
        })
        step_num += 1

    # Step 2: Variable Initializations & Parameter Calculations
    if init_lines:
        line_indices = [l[0] for l in init_lines]
        min_l, max_l = min(line_indices), max(line_indices)
        line_ref = f"Line {min_l}" if min_l == max_l else f"Lines {min_l}-{max_l}"
        snippets = " / ".join([f"`{l[1]}`" for l in init_lines[:3]])
        steps.append({
            "step_title": f"Initialization & Array Bound Extraction",
            "line_ref": line_ref,
            "complexity": "O(1)",
            "explanation": f"Computes input boundaries and state tracking variables ({snippets}). Executed once upfront in constant $O(1)$ time."
        })
        step_num += 1

    # Step 3..K: Breakdown each loop level / block
    if loop_blocks:
        for idx_l, loop in enumerate(loop_blocks):
            l_num = loop["line"]
            l_text = loop["text"]
            depth = loop["depth"]

            if depth == 1:
                comp = "O(N)" if "log" not in time_o.lower() else "O(log N)"
                steps.append({
                    "step_title": f"Primary Outer Iteration Pass",
                    "line_ref": f"Line {l_num}",
                    "complexity": comp,
                    "explanation": f"Executes outer control loop `{l_text}`. Iterates over input range producing {comp} step scaling across $N$ elements."
                })
            elif depth == 2:
                steps.append({
                    "step_title": f"Nested Inner Search / Comparison Pass",
                    "line_ref": f"Line {l_num}",
                    "complexity": "O(N²)" if ("N²" in time_o or "N^2" in time_o) else "O(N)",
                    "explanation": f"Executes inner nested loop `{l_text}` inside outer iteration. Re-evaluates bounds for each outer pass, accumulating quadratic $O(N^2)$ growth."
                })
            else:
                steps.append({
                    "step_title": f"Level-{depth} Nested Iteration Pass",
                    "line_ref": f"Line {l_num}",
                    "complexity": f"O(N^{depth})",
                    "explanation": f"Executes level-{depth} nested loop `{l_text}`, multiplying total step count by factor of $N$ per iteration."
                })
            step_num += 1

    # Step: Recursive calls (if any)
    if recursive_call_lines:
        r_idx, r_text, _ = recursive_call_lines[0]
        steps.append({
            "step_title": f"Recursive Divide & Branching Step",
            "line_ref": f"Line {r_idx}",
            "complexity": time_o,
            "explanation": f"Invokes recursive subproblem call `{r_text}`. Branching behavior generates call tree depth governed by asymptotic complexity {time_o}."
        })
        step_num += 1

    # Step: Conditional evaluation & In-loop body operations
    if cond_lines or op_lines:
        body_line_indices = [l[0] for l in cond_lines] + [l[0] for l in op_lines]
        if body_line_indices:
            min_l, max_l = min(body_line_indices), max(body_line_indices)
            line_ref = f"Line {min_l}" if min_l == max_l else f"Lines {min_l}-{max_l}"
            
            snippets = []
            if cond_lines:
                snippets.append(f"conditional check `{cond_lines[0][1]}`")
            if op_lines:
                snippets.append(f"body operation `{op_lines[0][1]}`")
                
            steps.append({
                "step_title": f"Loop Body Operations & Comparison Logic",
                "line_ref": line_ref,
                "complexity": time_o,
                "explanation": f"Evaluates inner operations ({' and '.join(snippets)}). Executed repeatedly across loop iterations, determining overall runtime."
            })
            step_num += 1

    # Step: Return statement
    if return_lines:
        r_idx, r_text = return_lines[-1]
        steps.append({
            "step_title": f"Return Result & Frame Teardown",
            "line_ref": f"Line {r_idx}",
            "complexity": "O(1)",
            "explanation": f"Executes `{r_text}` to return calculated output and pop stack frame from call memory in constant time $O(1)$."
        })
        step_num += 1

    # Step: Auxiliary Space memory card
    steps.append({
        "step_title": f"Auxiliary Space & Stack Memory Allocation",
        "line_ref": "Memory Stack",
        "complexity": space_o,
        "explanation": f"Auxiliary space footprint is {space_o}. Measures scalar variables, dynamic arrays, call stack frames, and intermediate buffers."
    })

    # 4. Bottlenecks Analysis
    if "N²" in time_o or "N^2" in time_o:
        l_ref = f"Line {loop_blocks[0]['line']}" if loop_blocks else "nested loop section"
        bottlenecks.append(f"Nested loop structure at {l_ref} creates quadratic $O(N^2)$ operation scaling.")
        if cond_lines:
            bottlenecks.append(f"Repeated conditional comparisons on Line {cond_lines[0][0]} executed up to $\\frac{{N(N-1)}}{{2}}$ times.")
        else:
            bottlenecks.append("Redundant comparisons executed across quadratic iteration space.")
    elif "N³" in time_o or "N^3" in time_o:
        bottlenecks.append("Triple nested loop structure produces cubic $O(N^3)$ computational complexity.")
    elif "2^N" in time_o:
        bottlenecks.append("Unmemoized recursive branching factor generates exponential $O(2^N)$ subproblem re-evaluations.")
    elif "N log N" in time_o:
        bottlenecks.append("Subproblem partition merging incurs $O(N)$ work across $\\log_2(N)$ call tree levels.")
    elif "log N" in time_o:
        bottlenecks.append("Requires pre-sorted input array; unsorted input requires an initial $O(N \\log N)$ sort cost.")
    elif time_o == "O(N)":
        bottlenecks.append("Linear single-pass traversal will scale latency proportionally for large datasets ($N > 1,000,000$).")

    # 5. Optimization Recommendations & Refactored Code
    optimized_code = code
    if "N²" in time_o or "N^2" in time_o:
        optimizations.append("Replace nested search loops with a Hash Map / Hash Set to achieve linear $O(N)$ time complexity.")
        optimizations.append("Utilize Two-Pointer sliding window techniques or Binary Search if searching ordered sequences.")
        if language == "python":
            optimized_code = (
                "# Optimized Refactored Solution (O(N) Time, O(N) Space)\n"
                "def optimized_solution(arr, target):\n"
                "    seen = {}\n"
                "    for idx, num in enumerate(arr):\n"
                "        diff = target - num\n"
                "        if diff in seen:\n"
                "            return [seen[diff], idx]\n"
                "        seen[num] = idx\n"
                "    return []\n"
            )
        elif language in ("cpp", "c++"):
            optimized_code = (
                "// Optimized Refactored Solution using std::unordered_map (O(N) Time)\n"
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
        elif language == "java":
            optimized_code = (
                "// Optimized Refactored Solution using HashMap (O(N) Time)\n"
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
        optimizations.append("Add Dynamic Programming memoization (top-down cache) or tabular iteration (bottom-up) to reduce time complexity to $O(N)$.")
        if language == "python":
            optimized_code = (
                "# Optimized DP / Iterative Fibonacci (O(N) Time, O(1) Space)\n"
                "def fibonacci_optimized(n):\n"
                "    if n <= 1:\n"
                "        return n\n"
                "    a, b = 0, 1\n"
                "    for _ in range(2, n + 1):\n"
                "        a, b = b, a + b\n"
                "    return b\n"
            )

    # 6. Executive summary
    executive_summary = (
        f"The submitted {language.title()} implementation ({total_lines} lines) exhibits a worst-case time complexity of {time_o} "
        f"and auxiliary space complexity of {space_o}. Overall operation count follows formula {formula}."
    )

    return {
        "executive_summary": executive_summary,
        "step_by_step": steps,
        "natural_explanation": executive_summary + "\n\n" + "\n\n".join([f"**{s['step_title']}** ({s['line_ref']}): {s['explanation']}" for s in steps]),
        "bottlenecks": bottlenecks,
        "optimization_suggestions": optimizations,
        "optimized_code": optimized_code,
        "line_costs": line_costs,
        "ai_source": "Built-in Structural Analysis Engine"
    }


def generate_ai_explanation(
    code: str,
    language: str,
    time_o: str,
    space_o: str,
    formula: str,
    api_key: str = None
) -> Dict[str, Any]:
    """
    Generate natural language complexity explanations, structural bottleneck callouts,
    and optimization recommendations using Gemini AI / OpenAI or the built-in static analysis engine.
    """
    gemini_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    # Filter out dummy placeholder keys
    if gemini_key and (gemini_key.startswith("AIzaSyBQwHDTeiD") or len(gemini_key) < 15):
        gemini_key = None
    if openai_key and (openai_key.startswith("sk-placeholder") or len(openai_key) < 15):
        openai_key = None

    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)

            prompt = f"""You are an expert algorithm complexity auditor. Analyze the following {language.upper()} code with 100% mathematical precision:

```{language}
{code}
```

Static analysis estimates:
- Time Complexity: {time_o}
- Space Complexity: {space_o}
- Step Formula: {formula}

Analyze the code rigorously line-by-line. Return ONLY a raw valid JSON object (no markdown formatting, no ```json tags) with exact structure:
{{
  "time_complexity_o": "O(...)",
  "time_complexity_omega": "Ω(...)",
  "time_complexity_theta": "Θ(...)",
  "space_complexity": "O(...)",
  "formula_str": "T = ...",
  "dominant_term": "...",
  "executive_summary": "Detailed 2-3 sentence executive summary explaining overall complexity, primary bottleneck, and runtime behavior.",
  "step_by_step": [
    {{
      "step_title": "Descriptive step title e.g. Variable Setup / Outer Control Loop",
      "line_ref": "Line X or Lines X-Y",
      "complexity": "O(1) or O(N) or O(N²)",
      "explanation": "Clear, concise mathematical explanation of operations, iteration count, and asymptotic growth in this step."
    }}
  ],
  "natural_explanation": "Detailed step-by-step mathematical explanation...",
  "bottlenecks": ["Bottleneck point 1...", "Bottleneck point 2..."],
  "optimization_suggestions": ["Optimization suggestion 1...", "Optimization suggestion 2..."],
  "optimized_code": "Full refactored code block in {language} with improved complexity",
  "line_costs": {{
    "1": {{"cost": "O(1)", "frequency": "Executed 1 time"}},
    "2": {{"cost": "O(N)", "frequency": "Executed N times"}},
    "3": {{"cost": "O(N²)", "frequency": "Executed N × N times"}}
  }}
}}

CRITICAL INSTRUCTIONS:
- Break down the code into 6 to 10 distinct, line-referenced `step_by_step` entries covering ALL functions, initializations, outer/inner loops, conditions, body statements, and memory stack setup in the input code.
- Do NOT condense or collapse the analysis into fewer than 5 steps for non-trivial code.
- "line_costs" MUST have an entry for EVERY line number 1..{len(code.splitlines())}.
"""

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            raw_text = response.text.strip()
            if raw_text.startswith("```"):
                lines = raw_text.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                raw_text = "\n".join(lines).strip()
            res_json = json.loads(raw_text)
            res_json["ai_source"] = "AI Analysis Engine"
            return res_json
        except Exception as e:
            print(f"Gemini API Execution Error: {e}")

    elif openai_key:
        try:
            import openai
            client = openai.OpenAI(api_key=openai_key)
            prompt = f"""Analyze the following {language.upper()} code snippet line-by-line:
```{language}
{code}
```
Return ONLY a valid JSON object with keys: time_complexity_o, time_complexity_omega, time_complexity_theta, space_complexity, formula_str, dominant_term, executive_summary, step_by_step, natural_explanation, bottlenecks, optimization_suggestions, optimized_code."""
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            res_json = json.loads(completion.choices[0].message.content)
            res_json["ai_source"] = "OpenAI GPT-4o-mini"
            return res_json
        except Exception as e:
            print(f"OpenAI API Execution Error: {e}")

    # Fallback to smart code-aware structural analysis engine
    return _parse_code_to_steps(code=code, language=language, time_o=time_o, space_o=space_o, formula=formula)


def chat_with_ai(
    code: str,
    language: str,
    time_o: str,
    space_o: str,
    formula: str,
    messages: List[Dict[str, str]],
    api_key: str = None
) -> str:
    """
    Handle conversational algorithm chat queries from the workspace user.
    Uses Gemini API if available, or smart contextual rule-based answers as fallback.
    """
    gemini_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if gemini_key and (gemini_key.startswith("AIzaSyBQwHDTeiD") or len(gemini_key) < 15):
        gemini_key = None

    last_user_msg = messages[-1]["content"] if messages else "Explain this algorithm."

    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            prompt = f"""You are an expert Computer Science Assistant & Algorithmic Complexity Auditor.
The user is inspecting the following {language.upper()} code in ComplexityLens:

```{language}
{code}
```

Current Analysis:
- Time Complexity: {time_o}
- Space Complexity: {space_o}
- Step Formula: {formula}

User Question: {last_user_msg}

Answer concisely, accurately, and clearly. Use markdown formatting and math notation where relevant (e.g. O(N²), T(N)). Provide short code snippets if asked for optimizations or edge cases."""

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return response.text.strip()
        except Exception as e:
            print(f"Gemini Chat Execution Error: {e}")

    # Smart Code-Aware Analysis Assistant Fallback
    query = last_user_msg.lower()

    # Handle Explanation & Walkthrough queries
    if any(k in query for k in ["explain", "breakdown", "how it works", "walkthrough", "understand", "detail", "step"]):
        steps_data = _parse_code_to_steps(code=code, language=language, time_o=time_o, space_o=space_o, formula=formula)
        steps_list = steps_data.get("step_by_step", [])
        
        md_lines = [
            f"### Algorithm Execution & Complexity Breakdown",
            f"The submitted **{language.capitalize()}** implementation runs with a worst-case time complexity of **{time_o}** and auxiliary space complexity of **{space_o}** (Step Formula: `{formula}`).\n",
            f"#### Line-by-Line Execution Steps:"
        ]
        
        for idx, s in enumerate(steps_list, 1):
            md_lines.append(f"{idx}. **{s['step_title']}** (*{s['line_ref']}*) — `{s['complexity']}`")
            md_lines.append(f"   {s['explanation']}\n")
            
        bottlenecks = steps_data.get("bottlenecks", [])
        if bottlenecks:
            md_lines.append("#### Performance Bottlenecks:")
            for b in bottlenecks:
                md_lines.append(f"- {b}")

        opts = steps_data.get("optimization_suggestions", [])
        if opts:
            md_lines.append("\n#### Suggested Optimizations:")
            for o in opts:
                md_lines.append(f"- {o}")
                
        return "\n".join(md_lines)

    if "time" in query or "big-o" in query or "slow" in query or "fast" in query or "complexity" in query:
        return f"The algorithm has a worst-case time complexity of **{time_o}**. This is governed by step operation formula `{formula}`. The nested loop levels determine how execution steps scale as input size $N$ grows."
    elif "space" in query or "memory" in query or "auxiliary" in query:
        return f"The space complexity is **{space_o}**. Memory is allocated for variables and execution stack frames during runtime."
    elif "optimize" in query or "refactor" in query or "better" in query or "improve" in query:
        if "N²" in time_o or "N^2" in time_o:
            return f"To optimize from **{time_o}** down to **O(N)**, consider using a Hash Map/HashSet to store previously seen elements, or sorting the input upfront to use a Two-Pointer sliding window."
        elif "2^N" in time_o:
            return f"To optimize from exponential **{time_o}** to **O(N)**, apply Dynamic Programming memoization (storing subproblem call results) or bottom-up iterative tabulation."
        else:
            return f"The current code is already running at an optimal **{time_o}** asymptotic time complexity."
    elif "edge" in query or "corner" in query or "bug" in query or "test" in query:
        return f"Key edge cases to test for this {language.capitalize()} algorithm:\n1. Empty input datasets ($N=0$)\n2. Single-element inputs ($N=1$)\n3. Large input boundaries ($N > 100,000$)\n4. Duplicate elements or negative integer inputs."
    else:
        return f"For this {language.capitalize()} algorithm with **{time_o}** time complexity and **{space_o}** space complexity:\n- Step Formula: `{formula}`\n- You can ask me to **explain the code line-by-line**, suggest **optimizations**, or list **edge cases**!"