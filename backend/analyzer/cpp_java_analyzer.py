import re
from typing import Dict, Any, List
from .sympy_solver import solve_loop_complexity

def analyze_cpp_java_code(code: str, language: str = "cpp") -> Dict[str, Any]:
    lines = code.splitlines()
    if not lines:
        return {
            "valid": False,
            "error": "Empty code provided"
        }
        
    loop_bounds = []
    line_costs = {}
    current_depth = 0
    max_depth = 0
    has_recursion = False
    is_divide_and_conquer = False
    recursion_branching = 1
    aux_space = "O(1)"
    
    # Extract function names for recursion check
    func_pattern = re.compile(r'(?:int|void|double|float|long|boolean|String|auto)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(')
    fn_matches = func_pattern.findall(code)
    fn_names = [f for f in fn_matches if f not in ('if', 'for', 'while', 'switch', 'main')]
    
    # Check for halving or divide & conquer indicators (e.g. / 2, mid, (l+r)/2, >> 1)
    has_halving = bool(re.search(r'(\bmid\b|/\s*2|>>\s*1|\(l\s*\+\s*r\)|low\s*\+\s*high)', code, re.IGNORECASE))
    
    # Check recursion occurrences
    for fn in fn_names:
        matches = re.findall(rf'\b{fn}\s*\(', code)
        if len(matches) > 1:  # 1 declaration + 1 or more recursive calls
            has_recursion = True
            recursion_branching = max(1, len(matches) - 1)
            aux_space = "O(N)"
            if has_halving or "merge" in fn.lower() or "sort" in fn.lower() or "quick" in fn.lower():
                is_divide_and_conquer = True
            
    # Check space complexity (vectors, dynamic arrays)
    if re.search(r'new\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\[', code) or re.search(r'vector\s*<.*>\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\(', code) or "ArrayList" in code:
        aux_space = "O(N)"
        
    for i, line_text in enumerate(lines, start=1):
        stripped = line_text.strip()
        if not stripped:
            line_costs[i] = {
                "line": i,
                "text": line_text,
                "cost": "O(0)",
                "frequency": "Blank line",
                "depth": 0
            }
            continue
        if stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
            line_costs[i] = {
                "line": i,
                "text": line_text,
                "cost": "O(0)",
                "frequency": "Comment",
                "depth": 0
            }
            continue
            
        # Detect loops
        is_for = re.search(r'\bfor\s*\(', stripped)
        is_while = re.search(r'\bwhile\s*\(', stripped)
        
        if is_for or is_while:
            step_type = "linear"
            if re.search(r'(\*=|/=|<<=|>>=|\*\s*2|/\s*2)', stripped):
                step_type = "logarithmic"
                
            var_name = f"var_{i}"
            m_var = re.search(r'for\s*\(\s*(?:int|long|size_t|auto)?\s*([a-zA-Z_][a-zA-Z0-9_]*)', stripped)
            if m_var:
                var_name = m_var.group(1)
                
            loop_bounds.append({
                "var": var_name,
                "start": "1",
                "end": "N",
                "step_type": step_type,
                "line": i
            })
            current_depth += 1
            max_depth = max(max_depth, current_depth)
            
        if "}" in stripped and current_depth > 0:
            current_depth = max(0, current_depth - 1)
            
        # Assign cost label
        depth = current_depth if not (is_for or is_while) else current_depth
        if depth == 0:
            cost_label = "O(1)"
            freq = "Executed 1 time"
        elif depth == 1:
            cost_label = "O(N)"
            freq = "Executed N times"
        elif depth == 2:
            cost_label = "O(N²)"
            freq = "Executed N × N times"
        elif depth == 3:
            cost_label = "O(N³)"
            freq = "Executed N³ times"
        else:
            cost_label = f"O(N^{depth})"
            freq = f"Executed N^{depth} times"
            
        if has_recursion and (";" in stripped or "return" in stripped):
            if is_divide_and_conquer:
                cost_label = "O(N log N)" if recursion_branching >= 2 else "O(log N)"
                freq = "Divide & conquer recursive step"
            else:
                cost_label = f"O({recursion_branching}^N)"
                freq = f"Recursive call tree depth N"
            
        line_costs[i] = {
            "line": i,
            "text": line_text,
            "cost": cost_label,
            "frequency": freq,
            "depth": depth
        }

    if has_recursion:
        if is_divide_and_conquer:
            if recursion_branching >= 2:
                time_o = "O(N log N)"
                formula = "T(N) = N · log₂(N)"
            else:
                time_o = "O(log N)"
                formula = "T(N) = log₂(N)"
        else:
            if recursion_branching >= 2:
                time_o = f"O({recursion_branching}^N)"
                formula = f"T(N) = {recursion_branching}^N - 1"
            else:
                time_o = "O(N)"
                formula = "T(N) = N"
        solver_res = {
            "time_complexity_o": time_o,
            "time_complexity_omega": time_o.replace("O(", "Ω("),
            "time_complexity_theta": time_o.replace("O(", "Θ("),
            "formula_str": formula,
            "latex_formula": formula.replace("log₂(N)", "\\log_2(N)"),
            "dominant_term": time_o[2:-1]
        }
    else:
        solver_res = solve_loop_complexity(loop_bounds)

    # Build React Flow graph for C++/Java
    nodes, edges = _build_cpp_java_graph(code, language, has_recursion)
    
    raw_lines = code.splitlines()
    loc_active = len([l for l in raw_lines if l.strip() and not l.strip().startswith('//') and not l.strip().startswith('/*')])
    
    return {
        "valid": True,
        "language": language,
        "time_complexity_o": solver_res["time_complexity_o"],
        "time_complexity_omega": solver_res["time_complexity_omega"],
        "time_complexity_theta": solver_res["time_complexity_theta"],
        "space_complexity": aux_space,
        "formula_str": solver_res["formula_str"],
        "latex_formula": solver_res["latex_formula"],
        "dominant_term": solver_res["dominant_term"],
        "line_costs": line_costs,
        "code_input_metrics": {
            "total_lines": len(raw_lines),
            "loc_active": loc_active,
            "char_count": len(code),
            "ast_node_count": len(nodes),
            "loops_count": len(loop_bounds),
            "max_nested_depth": max_depth,
        },
        "graph": {
            "nodes": nodes,
            "edges": edges
        },
        "loops_count": len(loop_bounds),
        "max_nested_depth": max_depth,
        "has_recursion": has_recursion,
        "recursion_branching": recursion_branching,
        "is_divide_and_conquer": is_divide_and_conquer,
        "explanations": [
            f"Parsed {language.upper()} code structure with {len(loop_bounds)} loop(s) and max nesting depth {max_depth}.",
            f"Determined time complexity as {solver_res['time_complexity_o']} and space complexity as {aux_space}."
        ]
    }

def _build_cpp_java_graph(code: str, language: str, has_recursion: bool) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    nodes = []
    edges = []
    
    root_id = "node_start"
    nodes.append({
        "id": root_id,
        "type": "startNode",
        "data": {"label": f"{language.upper()} Entrypoint", "type": "Start"},
        "position": {"x": 250, "y": 20}
    })
    
    lines = code.splitlines()
    prev_id = root_id
    y_offset = 100
    idx = 1
    
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped in ("{", "}") or stripped.startswith("//"):
            continue
            
        curr_id = f"node_{idx}"
        node_label = stripped[:30] + ("..." if len(stripped) > 30 else "")
        node_type = "statementNode"
        
        if "for" in stripped or "while" in stripped:
            node_type = "loopNode"
            node_label = "Loop Block"
        elif "if" in stripped:
            node_type = "branchNode"
            node_label = "Branch Condition"
        elif has_recursion and "(" in stripped and ";" in stripped:
            node_type = "recursionNode"
            node_label = "Recursive Call"
            
        nodes.append({
            "id": curr_id,
            "type": node_type,
            "data": {"label": node_label, "type": node_type.replace("Node", "")},
            "position": {"x": 250, "y": y_offset}
        })
        
        edges.append({
            "id": f"edge_{prev_id}_{curr_id}",
            "source": prev_id,
            "target": curr_id,
            "animated": node_type in ("loopNode", "recursionNode")
        })
        
        prev_id = curr_id
        y_offset += 85
        idx += 1
        if idx > 12: # limit graph node clutter
            break
            
    end_id = "node_end"
    nodes.append({
        "id": end_id,
        "type": "endNode",
        "data": {"label": "End / Return", "type": "End"},
        "position": {"x": 250, "y": y_offset}
    })
    edges.append({
        "id": f"edge_{prev_id}_{end_id}",
        "source": prev_id,
        "target": end_id
    })
    
    return nodes, edges
