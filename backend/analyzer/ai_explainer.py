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


def _call_gemini_models(client, prompt):
    models = ["gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash-lite"]
    last_err = None
    for model_name in models:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            return response.text.strip(), model_name
        except Exception as e:
            last_err = e
            continue
    raise last_err if last_err else Exception("No Gemini models available.")


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

            raw_text, used_model = _call_gemini_models(client, prompt)
            if raw_text.startswith("```"):
                lines = raw_text.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                raw_text = "\n".join(lines).strip()
            res_json = json.loads(raw_text)
            res_json["ai_source"] = f"Gemini 3.5 Flash Lite ({used_model})"
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
    Uses Gemini 3.5 Flash Lite API with multi-turn conversation context if available, or an advanced 
    line-aware and symbol-aware contextual analysis engine as fallback.
    """
    gemini_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if gemini_key and (gemini_key.startswith("AIzaSyBQwHDTeiD") or len(gemini_key) < 15):
        gemini_key = None

    last_user_msg = messages[-1]["content"] if messages else "Explain this algorithm."
    query = last_user_msg.strip()
    query_lower = query.lower()

    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)

            # Format multi-turn conversation history (up to last 6 messages)
            history_str = ""
            if len(messages) > 1:
                hist_items = []
                for m in messages[-6:-1]:
                    role_label = "User" if m["role"] == "user" else "Assistant"
                    hist_items.append(f"{role_label}: {m['content']}")
                history_str = "\n".join(hist_items)

            prompt = f"""You are ComplexityLens AI, an expert Computer Science Professor, Algorithmic Auditor, and Master Programming Educator.

CODE UNDER ANALYSIS ({language.upper()}):
```{language}
{code}
```

METRICS:
- Time Complexity: {time_o}
- Space Complexity: {space_o}
- Operation Step Formula: {formula}

CONVERSATION HISTORY:
{history_str if history_str else "None"}

CURRENT USER QUESTION:
{query}

CRITICAL INSTRUCTIONS:
- Directly and comprehensively answer the user's question, whether it is a definition, programming keyword inquiry, line breakdown, concept explanation, edge case query, or optimization request.
- SPECIAL INSTRUCTION FOR CONCEPT & DEFINITION QUESTIONS (e.g. "what is recursion", "what is dynamic programming", "meaning of edge case", "what is binary search", "what is memoization"):
  Provide a structured, educational breakdown:
  1. **Definition & Core Concept:** Clear explanation of the concept/algorithm.
  2. **How it Works & Key Properties:** Bullet points detailing core mechanics, base cases, state transitions, or array bounds.
  3. **Relevance to Current Code:** Explain how this concept applies (or can be applied) to the active {language.upper()} code snippet.
- SPECIAL INSTRUCTION FOR PROGRAM KEYWORDS & METHODS (e.g. "what is use of append", "what is yield", "what is lambda", "what is self", "what does pop do"):
  Provide a detailed 3-part response:
  1. **Definition & Technical Purpose:** Purpose of the keyword/method in standard {language.upper()}.
  2. **Occurrences in Current Code:** Show every line where it appears (with line numbers) and what it does on that line. (If it does not appear in the current code, state that clearly and give a concrete usage example).
  3. **Complexity Impact:** Time complexity per call ($O(1)$, $O(N)$) and space memory footprint.
- SPECIAL INSTRUCTION FOR "EXPLAIN EACH LINE" / "LINE BY LINE" / "WALKTHROUGH":
  Iterate line-by-line over EVERY line in the code (Line 1 to Line N). For EACH line, output:
  1. Line number & code snippet (`#### Line X: code`)
  2. Clear 1-2 sentence explanation of what that line does in the context of the algorithm.
  3. Execution step cost ($O(1)$, $O(N)$, etc.).
- Reference line numbers, variable names, functions, and loop levels in your answer.
- Format code blocks using ```{language} ... ``` with clear comments.
- Use LaTeX math notation ($O(N)$, $O(N^2)$, $\\Omega(N)$, $T(N)$) for mathematical expressions.
"""
            reply_text, used_model = _call_gemini_models(client, prompt)
            return reply_text
        except Exception as e:
            print(f"Gemini Chat Execution Error: {e}")

    # --- ADVANCED CODE-AWARE & CONCEPT-KNOWLEDGE FALLBACK ENGINE ---
    code_lines = code.splitlines()
    total_lines = len(code_lines)

    # 1. Specific Line Inquiry (e.g. "explain line 3", "what does line 5 do?", "line 2")
    line_match = re.search(r'\bline[s]?\s*(\d+)(?:\s*(?:to|-|and)\s*(\d+))?', query_lower)
    if line_match:
        l1 = int(line_match.group(1))
        l2 = int(line_match.group(2)) if line_match.group(2) else l1
        l1_valid = max(1, min(l1, total_lines))
        l2_valid = max(l1_valid, min(l2, total_lines))

        selected_lines = [(i, code_lines[i-1]) for i in range(l1_valid, l2_valid + 1)]
        line_ref_str = f"Line {l1_valid}" if l1_valid == l2_valid else f"Lines {l1_valid} to {l2_valid}"

        out = [f"### Code Inquiry: **{line_ref_str}**\n"]
        for idx, line_text in selected_lines:
            stripped = line_text.strip()
            indent = len(line_text) - len(line_text.lstrip())
            depth = max(1, indent // 4) if indent > 0 else 0

            cost = "O(1)"
            role = "State Setup / Statement"
            if "for " in stripped or "while " in stripped:
                cost = "O(N)" if depth <= 1 else f"O(N^{depth})"
                role = f"Loop Iteration Header (Nesting Depth {depth})"
            elif "if " in stripped or "elif " in stripped or "else" in stripped:
                cost = "O(1)"
                role = "Conditional Branch Evaluation"
            elif "return " in stripped:
                cost = "O(1)"
                role = "Result Return & Stack Frame Teardown"
            elif depth > 0:
                cost = "O(N)" if depth == 1 else f"O(N^{depth})"
                role = f"Inner Operation Body (Executes inside depth-{depth} loop)"

            out.append(f"```{language}\n{idx}: {line_text}\n```")
            out.append(f"- **Role:** {role}")
            out.append(f"- **Asymptotic Step Cost:** `{cost}`")
            out.append(f"- **Code Statement:** `{stripped}`")
            if "for " in stripped or "while " in stripped:
                out.append(f"  - Drives loop iteration over input sequence. Scales total operation count proportionally by $N$ per level.")
            elif "if " in stripped:
                out.append(f"  - Evaluates condition logic to control execution flow.")
            out.append("")

        return "\n".join(out).strip()

    # 2. Complete Line-by-Line Code Walkthrough Request
    if any(k in query_lower for k in ["explain each line", "each line", "all lines", "line by line", "step by step", "explain code", "code explanation", "breakdown", "walkthrough", "how it works"]):
        out = [
            f"### Line-by-Line Breakdown of `{language.upper()}` Implementation ({total_lines} Lines)\n",
            f"**Time Complexity:** **{time_o}** | **Space Complexity:** **{space_o}** (Step Formula: `{formula}`)\n"
        ]

        for idx, line_text in enumerate(code_lines, 1):
            stripped = line_text.strip()
            if not stripped:
                continue

            indent = len(line_text) - len(line_text.lstrip())
            depth = max(0, indent // 4) if indent > 0 else 0

            if stripped.startswith("def ") or stripped.startswith("function ") or "main(" in stripped or re.match(r'^(public|private|protected|static|inline|template|\w+)\s+[\w:<>]+\s*\(', stripped):
                role = "Function declaration — Defines scope entry point, allocates parameter call stack frame."
                cost = "$O(1)$ constant setup"
            elif stripped.startswith("if ") or stripped.startswith("elif ") or stripped.startswith("else"):
                role = "Conditional branch evaluation — Directs execution flow based on boolean condition check."
                cost = "$O(1)$ constant evaluation"
            elif stripped.startswith("for ") or stripped.startswith("while "):
                role = f"Loop control header (Nesting depth {depth+1}) — Drives iterative pass over dataset across $N$ steps."
                cost = f"$O(N^{depth+1})$" if depth >= 1 else "$O(N)$ linear pass"
            elif stripped.startswith("return "):
                role = "Return statement — Returns computed result to caller and releases stack frame memory."
                cost = "$O(1)$ constant return"
            elif "append(" in stripped or "push_back(" in stripped or "add(" in stripped:
                role = "Element insertion — Appends element to dynamic container tail in amortized constant time."
                cost = "$O(1)$ amortized"
            elif "pop(" in stripped or "pop_back(" in stripped:
                role = "Element removal — Removes element from container in constant time."
                cost = "$O(1)$ constant time"
            elif "len(" in stripped or ".length" in stripped or ".size()" in stripped:
                role = "Length evaluation — Accesses container size metadata."
                cost = "$O(1)$ constant time"
            elif "[" in stripped and ":" in stripped:
                role = "Sub-sequence slicing — Extracts sub-array slice, creating new allocated memory copy."
                cost = "$O(K)$ linear in slice length $K$"
            elif "=" in stripped:
                role = "Variable assignment & state update — Computes expression value and stores variable reference."
                cost = "$O(1)$ constant time"
            else:
                role = "Statement execution — Performs operation within current execution block scope."
                cost = "$O(1)$ step cost"

            out.append(f"#### **Line {idx}:** `{stripped}`")
            out.append(f"- **Explanation:** {role}")
            out.append(f"- **Asymptotic Cost:** {cost}\n")

        return "\n".join(out).strip()

    # 3. Optimization & Refactored Code Request
    if any(k in query_lower for k in ["optimize", "refactor", "rewrite", "improved code", "faster", "better way", "how to fix"]):
        steps_data = _parse_code_to_steps(code=code, language=language, time_o=time_o, space_o=space_o, formula=formula)
        opt_code = steps_data.get("optimized_code", code)
        opts = steps_data.get("optimization_suggestions", [])

        res = [
            f"### Optimization & Refactoring Guide for {language.upper()}",
            f"Current worst-case time complexity is **{time_o}**."
        ]
        if opts:
            res.append("\n**Key Improvement Strategies:**")
            for o in opts:
                res.append(f"- {o}")

        res.append(f"\n**Refactored Solution:**")
        res.append(f"```{language}\n{opt_code}\n```")
        res.append(f"\n*This refactored approach eliminates unnecessary iterations to optimize runtime latency.*")
        return "\n".join(res)

    # 4. Computer Science Concepts & Theoretical Definitions Knowledge Base
    CONCEPT_KB = {
        "recursion": {
            "title": "What is Recursion?",
            "definition": "Recursion is a programming paradigm where a function calls itself to solve smaller instances of the same problem until reaching a termination condition called the **Base Case**.",
            "points": [
                "**Base Case:** Stops infinite call tree recursion and prevents stack overflow.",
                "**Call Stack Depth:** Consumes $O(D)$ auxiliary memory frames for call depth $D$.",
                "**Subproblem Decomposition:** Used in Divide & Conquer (Merge Sort, Quick Sort, Tree Traversals)."
            ]
        },
        "dynamic programming": {
            "title": "What is Dynamic Programming (DP)?",
            "definition": "Dynamic Programming is an optimization strategy for solving problems with overlapping subproblems and optimal substructure by caching intermediate results.",
            "points": [
                "**Memoization (Top-Down):** Uses recursive calls backed by a lookup table/dictionary.",
                "**Tabulation (Bottom-Up):** Fills an iterative DP table starting from base cases.",
                "**Complexity Reduction:** Converts exponential $O(2^N)$ brute-force down to $O(N)$ or $O(N^2)$."
            ]
        },
        "dp": {
            "title": "What is Dynamic Programming (DP)?",
            "definition": "Dynamic Programming caches calculated subproblem answers to avoid redundant recomputations.",
            "points": [
                "Saves exponential calculation time using array/hash lookup tables.",
                "Common applications: Knapsack, Longest Common Subsequence, Shortest Paths."
            ]
        },
        "memoization": {
            "title": "What is Memoization?",
            "definition": "Memoization is a top-down dynamic programming optimization technique that stores the return values of expensive function calls.",
            "points": [
                "**Lookup Check:** Checks if `cache[arg]` exists before running recursive computations.",
                "**Space-Time Tradeoff:** Uses extra $O(N)$ memory to dramatically reduce runtime complexity."
            ]
        },
        "binary search": {
            "title": "What is Binary Search?",
            "definition": "Binary Search is a logarithmic $O(\\log N)$ search algorithm that locates a target element in a **sorted sequence** by repeatedly dividing the search space in half.",
            "points": [
                "**Prerequisite:** Array must be sorted upfront.",
                "**Midpoint Check:** Compares target against `arr[mid]`, eliminating half the remaining elements per pass.",
                "**Max Iterations:** Requires at most $\\log_2(N)$ comparisons."
            ]
        },
        "divide and conquer": {
            "title": "What is Divide & Conquer?",
            "definition": "Divide & Conquer breaks a complex problem into smaller subproblems, solves them recursively, and combines subproblem answers.",
            "points": [
                "**Divide:** Bisects dataset size $N$ into sub-parts.",
                "**Conquer & Combine:** Merges sorted results in $O(N)$ time per tree level.",
                "Examples: Merge Sort ($O(N \\log N)$), Binary Search ($O(\\log N)$)."
            ]
        },
        "sliding window": {
            "title": "What is the Sliding Window Technique?",
            "definition": "Sliding Window maintains a continuous subarray or substring bound using left and right index pointers.",
            "points": [
                "Avoids re-scanning overlapping ranges from scratch.",
                "Reduces nested $O(N^2)$ loops down to linear $O(N)$ execution."
            ]
        },
        "two pointers": {
            "title": "What is the Two Pointers Technique?",
            "definition": "Two Pointers uses two index variables iterating simultaneously (from opposite ends or fast/slow speeds) to process arrays.",
            "points": [
                "Ideal for sorted array target matching, array reversal, and cycle detection.",
                "Executes in linear $O(N)$ time with $O(1)$ space."
            ]
        },
        "base case": {
            "title": "What is a Base Case?",
            "definition": "A Base Case is the anchor condition in a recursive function that returns a value directly without spawning further recursive calls.",
            "points": [
                "Essential to prevent infinite call loops and StackOverflow errors.",
                "Executes in constant $O(1)$ time."
            ]
        },
        "edge case": {
            "title": "What is an Edge Case?",
            "definition": "An Edge Case (boundary condition) occurs at the extreme operational limits of an algorithm—such as $N=0$ empty inputs, single element $N=1$, duplicate values, or max integer bounds.",
            "points": [
                "**Prevents Crashes:** Handles null pointers, index out of bounds, and zero-division.",
                "**Correctness Guarantee:** Ensures algorithm holds under unexpected or minimal input conditions."
            ]
        },
        "big-o": {
            "title": "What is Big-O Notation?",
            "definition": "Big-O Notation ($O$) quantifies the worst-case asymptotic upper bound on runtime execution steps or memory allocation as input size $N$ grows toward infinity.",
            "points": [
                "**Worst-Case Bound:** Guarantees execution will never exceed this growth rate.",
                "Applied to your current code: Worst-case complexity is **" + time_o + "**."
            ]
        },
        "time complexity": {
            "title": "What is Time Complexity?",
            "definition": "Time Complexity measures how total operation step counts scale relative to input dataset size $N$.",
            "points": [
                "Your active code time complexity: **" + time_o + "**.",
                "Step operation formula: `" + formula + "`."
            ]
        },
        "space complexity": {
            "title": "What is Space Complexity?",
            "definition": "Space Complexity measures the auxiliary RAM memory allocated for extra arrays, hash maps, or call stack frames during execution.",
            "points": [
                "Your active code space complexity: **" + space_o + "**."
            ]
        },
        "lambda": {
            "title": "What is a Lambda Function?",
            "definition": "A `lambda` function is a small, inline anonymous function defined without a standard `def` header.",
            "points": [
                "Syntax in Python: `lambda arg1, arg2: expression`.",
                "Commonly used in `sorted()`, `map()`, and `filter()` callables."
            ]
        },
        "yield": {
            "title": "What is the `yield` Keyword?",
            "definition": "`yield` turns a standard function into a Python **Generator**, producing a sequence of values lazily on-demand.",
            "points": [
                "**Memory Savings:** Consumes $O(1)$ memory by producing values one-at-a-time.",
                "Pauses function execution state between calls."
            ]
        },
        "self": {
            "title": "What is `self` in Python?",
            "definition": "`self` represents the instance of the object within class methods, allowing direct access to instance attributes and methods.",
            "points": [
                "Passed automatically as the first parameter to Python instance methods.",
                "Binds member variables to object state."
            ]
        },
        "vector": {
            "title": "What is a `std::vector` in C++?",
            "definition": "`std::vector` is a dynamic array in C++ that grows automatically when elements are added.",
            "points": [
                "**Random Access:** Constant $O(1)$ element lookup via `vec[i]`.",
                "**Tail Insertion:** Amortized $O(1)$ constant time via `push_back()`."
            ]
        },
        "hashmap": {
            "title": "What is a HashMap / Dictionary?",
            "definition": "A Hash Map (`dict` in Python, `unordered_map` in C++) stores key-value pairs using hash tables for rapid indexing.",
            "points": [
                "**Lookups & Insertions:** Constant $O(1)$ average time complexity.",
                "**Space Footprint:** $O(N)$ auxiliary space for $N$ entries."
            ]
        }
    }

    # Match concept from Knowledge Base
    for concept_key, concept_data in CONCEPT_KB.items():
        if concept_key in query_lower:
            res = [
                f"### {concept_data['title']}\n",
                f"{concept_data['definition']}\n",
                "#### Key Mechanics & Properties:"
            ]
            for pt in concept_data['points']:
                res.append(f"- {pt}")

            res.append(f"\n#### Context in Your Active `{language.upper()}` Code:")
            res.append(f"- Worst-case time complexity: **{time_o}**")
            res.append(f"- Auxiliary space complexity: **{space_o}**")
            res.append(f"- Formula: `{formula}`")
            return "\n".join(res)

    # 5. Program Keyword / Built-in Method Inquiry
    BUILTIN_EXPLANATIONS = {
        "append": "In Python, `list.append(item)` adds a single element to the end of a dynamic list in **O(1) amortized constant time**. It appends elements into memory without needing full array copies.",
        "pop": "In Python, `list.pop()` removes and returns the last element in **O(1)** time. `list.pop(0)` removes from the front, shifting remaining elements in **O(N)** linear time.",
        "extend": "In Python, `list.extend(iterable)` appends all items from another collection to the list in **O(K)** time, where K is the count of appended items.",
        "insert": "In Python, `list.insert(index, item)` places an element at a specific index, requiring **O(N)** linear shifting of trailing elements.",
        "remove": "In Python, `list.remove(value)` searches for the first matching element and removes it in **O(N)** linear time.",
        "range": "In Python, `range(start, stop, step)` generates an immutable arithmetic sequence of integers on-demand in **O(1)** constant memory.",
        "len": "In Python/C++/Java/JS, `len()` / `.length` returns the total number of elements stored in a container in constant **O(1)** time.",
        "sort": "Sorts elements in-place using Timsort (Python) or IntroSort (C++) with a worst-case time complexity of **O(N log N)**.",
        "sorted": "Returns a new sorted list containing all items from the iterable in **O(N log N)** time and **O(N)** auxiliary space.",
        "push": "In JavaScript/C++, `array.push(val)` appends an element to the container tail in **O(1)** amortized time.",
        "push_back": "In C++, `std::vector::push_back(val)` appends an element to the container tail in **O(1)** amortized time.",
        "emplace_back": "In C++, `std::vector::emplace_back()` constructs an element directly at the tail of the vector in **O(1)** amortized time without copying.",
        "split": "Splits a string into a list of sub-strings by a specified delimiter in **O(N)** linear time.",
        "join": "Concatenates elements of an array/list into a single string separated by a string delimiter in **O(N)** linear time.",
        "add": "Inserts an element into a HashSet/Set in **O(1)** average time.",
        "put": "Inserts a key-value pair into a HashMap or dictionary in **O(1)** average time.",
        "get": "Retrieves a value associated with a key from a map or dictionary in **O(1)** average time.",
        "enumerate": "In Python, `enumerate(iterable)` yields index-element tuples during iteration without allocating extra memory arrays ($O(1)$ space).",
        "zip": "In Python, `zip(*iterables)` aggregates elements from multiple collections into tuples on-the-fly ($O(1)$ memory generator)."
    }

    code_words = set(re.findall(r'\b[a-zA-Z_]\w*\b', code))
    all_known_words = set(BUILTIN_EXPLANATIONS.keys()).union(code_words)
    matched_word = next((w for w in all_known_words if w.lower() in query_lower and len(w) > 1 and w.lower() not in ["def", "for", "while", "return", "if", "else", "in", "int", "void", "public", "class", "std", "vector"]), None)

    if matched_word:
        var_name = matched_word
        var_lower = var_name.lower()
        matching_code_lines = [(idx+1, line) for idx, line in enumerate(code_lines) if var_name in line]

        res = [f"### Code Symbol & Method Analysis: `{var_name}`\n"]

        # 1. Definition & Technical Purpose
        res.append("#### 1. Definition & Technical Purpose")
        if var_lower in BUILTIN_EXPLANATIONS:
            res.append(f"{BUILTIN_EXPLANATIONS[var_lower]}\n")
        else:
            res.append(f"`{var_name}` is a variable or function symbol in your {language.upper()} code used to store or transform execution state.\n")

        # 2. Occurrences & Role in Your Code
        res.append(f"#### 2. Occurrences & Role in Your {language.upper()} Code")
        if matching_code_lines:
            res.append(f"Found `{var_name}` on **{len(matching_code_lines)} line(s)**:")
            for idx, line in matching_code_lines:
                stripped = line.strip()
                ctx_note = ""
                if "append" in var_lower or "push" in var_lower:
                    ctx_note = " — Inserts element into target dynamic collection."
                elif "=" in stripped:
                    ctx_note = " — State assignment/update operation."
                elif "for " in stripped or "while " in stripped:
                    ctx_note = " — Evaluates as loop boundary or iterator state."
                res.append(f"- **Line {idx}:** `{stripped}`{ctx_note}")
        else:
            res.append(f"`{var_name}` is a standard {language.upper()} keyword/symbol. It does not explicitly appear in your active code snippet, but is a core language feature.")
        res.append("")

        # 3. Complexity & Algorithmic Impact
        res.append("#### 3. Asymptotic & Performance Impact")
        if var_lower in ["append", "push", "push_back", "emplace_back"]:
            res.append(f"- **Time Complexity:** Executed in **$O(1)$ amortized constant time** per call.")
            res.append(f"- **Space Complexity:** Allocates memory in dynamic buffer, accumulating **$O(N)$ auxiliary space** across $N$ elements.")
        elif var_lower in ["pop", "remove", "insert", "splice"]:
            res.append(f"- **Time Complexity:** Standard pop/remove from end is **$O(1)$**, while popping index 0 or inserting requires **$O(N)$ linear element shifting**.")
            res.append(f"- **Space Complexity:** Modifies existing array in-place ($O(1)$ extra space).")
        elif var_lower in ["sort", "sorted"]:
            res.append(f"- **Time Complexity:** Executes worst-case **$O(N \\log N)$** sorting comparison passes.")
            res.append(f"- **Space Complexity:** Requires **$O(N)$** auxiliary memory (Timsort/merge allocation).")
        elif var_lower in ["range", "len", "size", "length"]:
            res.append(f"- **Time Complexity:** Constant **$O(1)$** metadata access / sequence generator.")
            res.append(f"- **Space Complexity:** Constant **$O(1)$** auxiliary space.")
        else:
            res.append(f"- Operating on `{var_name}` executes in constant **$O(1)$** time per line pass.")

        return "\n".join(res)

    # 6. Fallback General Code & Algorithm Explanation
    return (
        f"### {language.upper()} Code & Algorithm Explanation\n\n"
        f"**Algorithm Metric Summary:**\n"
        f"- **Worst-Case Time Complexity:** **{time_o}**\n"
        f"- **Auxiliary Space Complexity:** **{space_o}**\n"
        f"- **Operation Step Formula:** `{formula}`\n\n"
        f"**What would you like to know?** You can ask me:\n"
        f"- *\"What is recursion / dynamic programming / binary search?\"*\n"
        f"- *\"What is the use of append / pop / range / lambda?\"*\n"
        f"- *\"Explain line 3\" or \"Explain each line\"*\n"
        f"- *\"What edge cases should I test?\"*\n"
        f"- *\"How can I optimize this code to O(N)?\"*"
    )