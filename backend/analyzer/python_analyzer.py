import ast
import networkx as nx
from typing import Dict, Any, List, Tuple
from .sympy_solver import solve_loop_complexity

KNOWN_BUILTIN_COSTS = {
    "sorted": "O(N log N)",
    "sort": "O(N log N)",
    "min": "O(N)",
    "max": "O(N)",
    "sum": "O(N)",
    "factorial": "O(N)",  # the multiplication chain itself is O(n), even though math.factorial is one call
    "reversed": "O(N)",
}


def _detect_uncounted_builtin_cost(tree) -> str | None:
    """
    Scans for calls to known non-constant builtins that occur OUTSIDE any
    loop the AST-based loop analysis would already have counted. Returns
    the worst-case Big-O found, or None if nothing relevant is found.
    This guards against the "zero visible loops, real cost is inside a
    builtin call" blind spot (e.g. sorted(arr), math.factorial(n)).
    """
    worst = None
    priority = {"O(N)": 1, "O(N log N)": 2}

    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            func_name = None
            if isinstance(node.func, ast.Name):
                func_name = node.func.id
            elif isinstance(node.func, ast.Attribute):
                func_name = node.func.attr

            if func_name in KNOWN_BUILTIN_COSTS:
                candidate = KNOWN_BUILTIN_COSTS[func_name]
                if worst is None or priority.get(candidate, 0) > priority.get(worst, 0):
                    worst = candidate

    return worst

class PythonCodeAnalyzer(ast.NodeVisitor):
    def __init__(self, code: str):
        self.code = code
        self.lines = code.splitlines()
        self.tree = None
        self.loop_stack = []
        self.max_depth = 0
        self.loops_info = []
        self.recursive_calls = []
        self.line_costs = {}
        self.nodes = []
        self.edges = []
        self.node_counter = 0
        self.aux_space = "O(1)"
        self.has_recursion = False
        self.recursion_branching = 1
        self.is_divide_and_conquer = False
        self.is_memoized = False
        
    def analyze(self) -> Dict[str, Any]:
        try:
            self.tree = ast.parse(self.code)
        except SyntaxError as err:
            return {
                "error": f"Syntax Error at line {err.lineno}: {err.msg}",
                "valid": False
            }
            
        self._detect_recursion()
        self._detect_space_complexity()
        self.visit(self.tree)
        self._generate_line_costs()
        self._build_ast_graph()
        
        # Calculate time complexity using AST structural analysis & SymPy
        if self.has_recursion:
            if self.is_memoized:
                time_o = "O(N)"
                time_omega = "Ω(N)"
                time_theta = "Θ(N)"
                formula = "T(N) = N (Memoized)"
            elif self.is_divide_and_conquer:
                if self.recursion_branching >= 2:
                    time_o = "O(N log N)"
                    time_omega = "Ω(N log N)"
                    time_theta = "Θ(N log N)"
                    formula = "T(N) = N · log₂(N)"
                else:
                    time_o = "O(log N)"
                    time_omega = "Ω(log N)"
                    time_theta = "Θ(log N)"
                    formula = "T(N) = log₂(N)"
            else:
                if self.recursion_branching >= 2:
                    time_o = f"O({self.recursion_branching}^N)"
                    time_omega = f"Ω({self.recursion_branching}^N)"
                    time_theta = f"Θ({self.recursion_branching}^N)"
                    formula = f"T(N) = {self.recursion_branching}^N - 1"
                else:
                    time_o = "O(N)"
                    time_omega = "Ω(N)"
                    time_theta = "Θ(N)"
                    formula = "T(N) = N"
            solver_res = {
                "time_complexity_o": time_o,
                "time_complexity_omega": time_omega,
                "time_complexity_theta": time_theta,
                "formula_str": formula,
                "latex_formula": formula.replace("log₂(N)", "\\log_2(N)"),
                "dominant_term": time_o[2:-1]
            }
        else:
            solver_res = solve_loop_complexity(self.loops_info)
            if solver_res["time_complexity_o"] == "O(1)":
                builtin_cost = _detect_uncounted_builtin_cost(self.tree)
                if builtin_cost:
                    # Extract just the inner term (e.g. "N" or "N log N") for formula/latex/dominant_term
                    inner_term = builtin_cost.replace("O(", "").replace(")", "")
                    solver_res["time_complexity_o"] = builtin_cost
                    solver_res["time_complexity_omega"] = builtin_cost.replace("O(", "Ω(")
                    solver_res["time_complexity_theta"] = builtin_cost.replace("O(", "Θ(")
                    solver_res["formula_str"] = f"T = {inner_term} (cost hidden inside a builtin/library call)"
                    solver_res["latex_formula"] = f"T = {inner_term.replace(' log ', ' \\\\log_2 ')}"
                    solver_res["dominant_term"] = inner_term

        return {
            "valid": True,
            "language": "python",
            "time_complexity_o": solver_res["time_complexity_o"],
            "time_complexity_omega": solver_res["time_complexity_omega"],
            "time_complexity_theta": solver_res["time_complexity_theta"],
            "space_complexity": self.aux_space,
            "formula_str": solver_res["formula_str"],
            "latex_formula": solver_res["latex_formula"],
            "dominant_term": solver_res["dominant_term"],
            "line_costs": self.line_costs,
            "graph": {
                "nodes": self.nodes,
                "edges": self.edges
            },
            "loops_count": len(self.loops_info),
            "max_nested_depth": self.max_depth,
            "has_recursion": self.has_recursion,
            "recursion_branching": self.recursion_branching,
            "is_divide_and_conquer": self.is_divide_and_conquer,
            "is_memoized": self.is_memoized,
            "explanations": self._generate_rule_explanation(solver_res["time_complexity_o"])
        }

    def _detect_recursion(self):
        """
        Generalized Recursive AST Inspector:
        Analyzes variable scopes, list comprehensions, slicing, division, and memoization
        to determine if recursion is Divide & Conquer (O(N log N) / O(log N)), Memoized (O(N)), or Exponential (O(2^N)).
        """
        for node in ast.walk(self.tree):
            if isinstance(node, ast.FunctionDef):
                fn_name = node.name
                recursive_calls = []
                has_partitioning = False
                
                # Check for decorators like @lru_cache or @cache
                for decorator in node.decorator_list:
                    dec_str = ast.unparse(decorator) if hasattr(ast, 'unparse') else ""
                    if "cache" in dec_str or "memo" in dec_str:
                        self.is_memoized = True

                # Track variables derived from list filtering, comprehension, slicing, or division
                partitioned_vars = set()
                
                for child in ast.walk(node):
                    if isinstance(child, ast.Assign):
                        # List comprehensions (e.g. left = [x for x in arr if x < pivot])
                        if isinstance(child.value, ast.ListComp):
                            for target in child.targets:
                                if isinstance(target, ast.Name):
                                    partitioned_vars.add(target.id)
                        # Division operations (e.g. mid = len(arr) // 2)
                        elif isinstance(child.value, ast.BinOp) and isinstance(child.value.op, (ast.FloorDiv, ast.Div, ast.RShift)):
                            for target in child.targets:
                                if isinstance(target, ast.Name):
                                    partitioned_vars.add(target.id)
                        # Slices (e.g. left = arr[:mid])
                        elif isinstance(child.value, ast.Subscript):
                            for target in child.targets:
                                if isinstance(target, ast.Name):
                                    partitioned_vars.add(target.id)
                        # Filter calls (e.g. left = list(filter(...)))
                        elif isinstance(child.value, ast.Call):
                            func_name = ast.unparse(child.value.func) if hasattr(ast, 'unparse') else ""
                            if "filter" in func_name or "slice" in func_name:
                                for target in child.targets:
                                    if isinstance(target, ast.Name):
                                        partitioned_vars.add(target.id)
                                        
                    # Check dictionary or array memoization inside body
                    if isinstance(child, ast.Subscript) and isinstance(child.ctx, ast.Store):
                        if isinstance(child.value, ast.Name) and child.value.id in ('memo', 'dp', 'cache', 'seen'):
                            self.is_memoized = True

                # Inspect all recursive call invocations
                for child in ast.walk(node):
                    if isinstance(child, ast.Call):
                        if isinstance(child.func, ast.Name) and child.func.id == fn_name:
                            recursive_calls.append(child)
                            for arg in child.args:
                                arg_str = ast.unparse(arg) if hasattr(ast, 'unparse') else ""
                                # Check if argument is a partitioned variable (e.g., quick_sort(left))
                                for p_var in partitioned_vars:
                                    if p_var in arg_str:
                                        has_partitioning = True
                                # Check if argument is an explicit slice (e.g., merge_sort(arr[:mid]))
                                if isinstance(arg, ast.Subscript):
                                    has_partitioning = True
                                # Check halving math expressions in args
                                if "//" in arg_str or "/ 2" in arg_str or "/2" in arg_str or ">>" in arg_str:
                                    has_partitioning = True
                                # Check tree child attributes (node.left, node.right)
                                if isinstance(arg, ast.Attribute) and arg.attr in ('left', 'right', 'children'):
                                    has_partitioning = True

                if recursive_calls:
                    self.has_recursion = True
                    self.recursion_branching = len(recursive_calls)
                    self.is_divide_and_conquer = has_partitioning
                    self.aux_space = "O(N)"

    def _detect_space_complexity(self):
        """Inspect list comprehensions, matrix creations, or dynamic allocations"""
        for node in ast.walk(self.tree):
            if isinstance(node, ast.ListComp):
                self.aux_space = "O(N)"
            elif isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id in ('list', 'dict', 'set', 'append', 'extend'):
                    self.aux_space = "O(N)"
            elif isinstance(node, ast.BinOp) and isinstance(node.op, ast.Mult):
                self.aux_space = "O(N)"

    def visit_For(self, node: ast.For):
        var_name = node.target.id if isinstance(node.target, ast.Name) else "i"
        step_type = "linear"
        start_val = "1"
        end_val = "N"
        
        if isinstance(node.iter, ast.Call) and isinstance(node.iter.func, ast.Name) and node.iter.func.id == "range":
            args = node.iter.args
            if len(args) == 1:
                end_val = ast.unparse(args[0])
            elif len(args) >= 2:
                start_val = ast.unparse(args[0])
                end_val = ast.unparse(args[1])
            if len(args) == 3:
                step_str = ast.unparse(args[2])
                if "*" in step_str or "/" in step_str or "<<" in step_str or ">>" in step_str:
                    step_type = "logarithmic"
        elif hasattr(ast, 'unparse'):
            end_val = f"len({ast.unparse(node.iter)})"
                    
        loop_info = {
            "var": var_name,
            "start": start_val,
            "end": end_val,
            "step_type": step_type,
            "line": node.lineno
        }
        
        self.loop_stack.append(loop_info)
        self.loops_info.append(loop_info)
        self.max_depth = max(self.max_depth, len(self.loop_stack))
        
        self.generic_visit(node)
        self.loop_stack.pop()

    def visit_While(self, node: ast.While):
        step_type = "linear"
        var_name = "w"
        
        for child in ast.walk(node):
            if isinstance(child, ast.AugAssign) and isinstance(child.op, (ast.Mult, ast.FloorDiv, ast.Div, ast.LShift, ast.RShift)):
                step_type = "logarithmic"
            elif isinstance(child, ast.Assign):
                if isinstance(child.value, ast.BinOp) and isinstance(child.value.op, (ast.Mult, ast.FloorDiv, ast.Div, ast.LShift, ast.RShift)):
                    step_type = "logarithmic"
                    
        loop_info = {
            "var": var_name,
            "start": "1",
            "end": "N",
            "step_type": step_type,
            "line": node.lineno
        }
        self.loop_stack.append(loop_info)
        self.loops_info.append(loop_info)
        self.max_depth = max(self.max_depth, len(self.loop_stack))
        
        self.generic_visit(node)
        self.loop_stack.pop()

    def _generate_line_costs(self):
        for i, line_text in enumerate(self.lines, start=1):
            line_str = line_text.strip()
            if not line_str or line_str.startswith("#"):
                continue
                
            depth = self._get_line_depth(i)
                
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
                
            if self.has_recursion:
                if "(" in line_str and ("return" in line_str or "=" in line_str or "+" in line_str):
                    if self.is_memoized:
                        cost_label = "O(N)"
                        freq = "Memoized state lookup"
                    elif self.is_divide_and_conquer:
                        cost_label = "O(N log N)" if self.recursion_branching >= 2 else "O(log N)"
                        freq = "Divide & conquer recursive step"
                    else:
                        cost_label = f"O({self.recursion_branching}^N)"
                        freq = f"Recursive call tree depth N"
                
            self.line_costs[i] = {
                "line": i,
                "text": line_text,
                "cost": cost_label,
                "frequency": freq,
                "depth": depth
            }

    def _get_line_depth(self, lineno: int) -> int:
        depth = 0
        for node in ast.walk(self.tree):
            if hasattr(node, 'lineno') and hasattr(node, 'end_lineno'):
                if node.lineno <= lineno <= node.end_lineno:
                    if isinstance(node, (ast.For, ast.While)):
                        depth += 1
        return depth

    def _build_ast_graph(self):
        self.nodes = []
        self.edges = []
        
        root_id = "node_root"
        self.nodes.append({
            "id": root_id,
            "type": "startNode",
            "data": {"label": "Program Start", "type": "Start"},
            "position": {"x": 250, "y": 20}
        })
        
        y_offset = 100
        prev_id = root_id
        
        for idx, node in enumerate(ast.iter_child_nodes(self.tree)):
            curr_id = f"node_{idx}"
            node_label = ast.unparse(node) if hasattr(ast, 'unparse') else type(node).__name__
            if len(node_label) > 30:
                node_label = node_label[:27] + "..."
                
            node_type = "statementNode"
            if isinstance(node, (ast.For, ast.While)):
                node_type = "loopNode"
                node_label = f"Loop (Depth {self._get_line_depth(getattr(node, 'lineno', 1))})"
            elif isinstance(node, ast.If):
                node_type = "branchNode"
                node_label = "If Condition"
            elif isinstance(node, ast.FunctionDef):
                node_type = "funcNode"
                node_label = f"def {node.name}(...)"
                if self.has_recursion:
                    node_type = "recursionNode"
                    node_label = f"Recursive {node.name}(...)"
                    
            self.nodes.append({
                "id": curr_id,
                "type": node_type,
                "data": {"label": node_label, "type": node_type.replace("Node", "")},
                "position": {"x": 250, "y": y_offset}
            })
            
            self.edges.append({
                "id": f"edge_{prev_id}_{curr_id}",
                "source": prev_id,
                "target": curr_id,
                "animated": node_type in ("loopNode", "recursionNode")
            })
            
            prev_id = curr_id
            y_offset += 90
            
        end_id = "node_end"
        self.nodes.append({
            "id": end_id,
            "type": "endNode",
            "data": {"label": "Program End", "type": "End"},
            "position": {"x": 250, "y": y_offset}
        })
        self.edges.append({
            "id": f"edge_{prev_id}_{end_id}",
            "source": prev_id,
            "target": end_id
        })

    def _generate_rule_explanation(self, time_o: str) -> List[str]:
        explanations = []
        if time_o == "O(1)":
            explanations.append("The code consists of constant-time operations with no input-dependent loops or recursion.")
        elif time_o == "O(log N)":
            explanations.append("The iteration or recursive space is halved in each step (logarithmic growth).")
        elif time_o == "O(N)":
            explanations.append("Contains a single linear loop, traversal, or memoized state lookup.")
        elif time_o == "O(N log N)":
            explanations.append("Divide & Conquer algorithm: recursive partitioning / halving across log2(N) levels with O(N) work per level.")
        elif time_o == "O(N²)":
            explanations.append("Contains 2 nested loops iterating over N elements, resulting in N × N total executions.")
        elif time_o == "O(N³)":
            explanations.append("Contains 3 nested loops.")
        elif "2^N" in time_o:
            explanations.append("Recursive call tree branches multiple times without partitioning or memoization, leading to exponential O(2^N) growth.")
            
        if self.aux_space != "O(1)":
            explanations.append(f"Auxiliary Space Complexity is {self.aux_space} due to call stack memory or array allocations.")
        else:
            explanations.append("Auxiliary Space Complexity is O(1) as only scalar variables are allocated.")
            
        return explanations

def analyze_python_code(code: str) -> Dict[str, Any]:
    analyzer = PythonCodeAnalyzer(code)
    return analyzer.analyze()
