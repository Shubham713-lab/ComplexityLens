import sympy as sp
from typing import Dict, Any, List

def solve_loop_complexity(loop_bounds: List[Dict[str, Any]], inner_cost: int = 1) -> Dict[str, Any]:
    """
    Given a list of nested loop bounds from outer to inner, compute exact formula T(...)
    and determine single or multi-variable Big-O, Big-Omega, and Big-Theta asymptotic complexities.
    Supports O(N*M), O(N+M), O(N^2), O(N log N), O(N*M*K), etc.
    """
    if not loop_bounds:
        return {
            "time_complexity_o": "O(1)",
            "time_complexity_omega": "Ω(1)",
            "time_complexity_theta": "Θ(1)",
            "space_complexity": "O(1)",
            "formula_str": "T = 1",
            "latex_formula": "T = 1",
            "dominant_term": "1"
        }
    
    # Map loop variables to canonical symbols N, M, K...
    sym_map = {}
    canonical_symbols = ['N', 'M', 'K', 'W', 'P']
    sym_idx = 0
    
    has_log = False
    log_count = 0
    
    # Analyze bounds
    symbolic_bounds = []
    for bound in loop_bounds:
        end_str = str(bound.get('end', 'N')).strip()
        var_name = str(bound.get('var', 'i')).strip()
        step_type = bound.get('step_type', 'linear')
        
        if step_type == 'logarithmic':
            has_log = True
            log_count += 1
            
        clean_end = end_str.replace("len(", "").replace(")", "").strip()
        if clean_end not in sym_map:
            if clean_end in ('1', '0', 'True', 'False', 'None'):
                sym_map[clean_end] = sp.Integer(1)
            else:
                sym_name = canonical_symbols[sym_idx % len(canonical_symbols)]
                sym_idx += 1
                sym_map[clean_end] = sp.Symbol(sym_name, positive=True, integer=True)
                
        dim_sym = sym_map[clean_end]
        symbolic_bounds.append((var_name, dim_sym, step_type))
        
    current_expr = sp.Integer(inner_cost)
    
    # Perform summation from inside out
    for var_name, dim_sym, step_type in reversed(symbolic_bounds):
        var_sym = sp.Symbol(var_name)
        if step_type == 'logarithmic':
            log_sym = sp.Symbol(f'log2_{dim_sym}')
            current_expr = current_expr * log_sym
        else:
            if dim_sym == 1:
                pass
            else:
                try:
                    sum_res = sp.summation(current_expr, (var_sym, 1, dim_sym))
                    current_expr = sp.simplify(sum_res)
                except Exception:
                    current_expr = current_expr * dim_sym

    simplified_expr = sp.expand(current_expr)
    free_sym_objs = sorted([s for s in simplified_expr.free_symbols if not s.name.startswith('log2_')], key=lambda s: s.name)
    
    # Build Big-O expression
    if not free_sym_objs:
        if has_log:
            big_o = "O(log N)" if log_count == 1 else f"O((log N)^{log_count})"
        else:
            big_o = "O(1)"
    elif len(free_sym_objs) == 1:
        target_sym = free_sym_objs[0]
        s_name = target_sym.name
        deg = 0
        try:
            poly = sp.Poly(simplified_expr, target_sym)
            deg = int(poly.degree())
        except Exception:
            deg = len(symbolic_bounds)
            
        if has_log:
            if deg == 0:
                big_o = f"O(log {s_name})"
            elif deg == 1:
                big_o = f"O({s_name} log {s_name})"
            else:
                big_o = f"O({s_name}^{deg} log {s_name})"
        else:
            if deg == 0:
                big_o = "O(1)"
            elif deg == 1:
                big_o = f"O({s_name})"
            elif deg == 2:
                big_o = f"O({s_name}²)"
            elif deg == 3:
                big_o = f"O({s_name}³)"
            else:
                big_o = f"O({s_name}^{deg})"
    else:
        # Multi-variable complexity (e.g. O(N · M))
        terms = " · ".join([s.name for s in free_sym_objs])
        big_o = f"O({terms})"
        if has_log:
            big_o += " log N"

    # Normalize single symbol name to N if only 1 variable
    if len(free_sym_objs) == 1 and free_sym_objs[0].name != 'N':
        big_o = big_o.replace(free_sym_objs[0].name, 'N')
        
    omega = big_o.replace("O(", "Ω(")
    theta = big_o.replace("O(", "Θ(")
    
    formula_clean = str(simplified_expr).replace("log2_", "log₂(").replace("**", "^").replace("*", "·")
    latex_clean = sp.latex(simplified_expr).replace("log2_{", "\\log_2(")
    
    return {
        "time_complexity_o": big_o,
        "time_complexity_omega": omega,
        "time_complexity_theta": theta,
        "formula_str": f"T = {formula_clean}",
        "latex_formula": f"T = {latex_clean}",
        "dominant_term": big_o.replace("O(", "").replace(")", "")
    }
