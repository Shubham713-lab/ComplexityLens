# ComplexityLens — Backend Review & Fix Log

This log documents a backend review session performed after a collaborator restructured the project (new `main.py`, `analyzer/python_analyzer.py`, `analyzer/cpp_java_analyzer.py`, `analyzer/sympy_solver.py`, `analyzer/execution_benchmark.py`, `analyzer/ai_explainer.py`). Scope was intentionally limited to backend fixes; frontend issues are handed off separately below.

## Fixed in this session

### 1. Hardcoded API key removed (Critical security fix)
- **Found:** a Gemini API key was hardcoded in two places — `backend/analyzer/ai_explainer.py` (`DEFAULT_GEMINI_KEY` constant, used as a silent fallback) and `frontend/src/App.jsx` (default value in a `useState` call, meaning it shipped to every browser that loaded the app).
- **Fixed:** both hardcoded values removed. Backend now reads `GROQ_API_KEY` from environment only, with **no fallback default**. `.env` created (backend only, never committed) containing:
  ```
  GROQ_API_KEY=...
  MODEL_NAME=openai/gpt-oss-20b
  ```
- **Verified:** `git check-ignore -v backend\.env` confirms `.env` is properly gitignored and will not be committed.
- **Outstanding action:** the original exposed Gemini key should be rotated/revoked in Google AI Studio regardless of the code fix — it was exposed in git history and must be treated as already compromised.

### 2. Migrated AI provider from Gemini to Groq
- Replaced the `google.genai` SDK call in `ai_explainer.py` with `openai.OpenAI` pointed at Groq's OpenAI-compatible endpoint (`base_url="https://api.groq.com/openai/v1"`), using `response_format={"type": "json_object"}` for reliable structured output instead of manually stripping markdown fences from free text.
- Model name now configurable via `MODEL_NAME` env var (default `openai/gpt-oss-20b`), not hardcoded.
- **Verified working live** — confirmed `ai_source: "Groq AI (openai/gpt-oss-20b)"` in real API responses, with genuinely useful generated explanations/bottlenecks/optimized code.
- The original rule-based fallback (`_rule_based_ai_fallback`) is preserved and still used as a fallback if the Groq call fails for any reason.

### 3. Math/builtin-call misclassification bug — found and fixed
- **Problem:** the static analyzer (`python_analyzer.py`) only detects complexity from loops/recursion visible in the submitted code's AST. Code whose real cost is hidden inside a builtin or library call (e.g. `math.factorial(n)`, `sorted(arr)`) has zero visible loops, so it was incorrectly defaulting to `O(1)`.
- **Fix:** added `KNOWN_BUILTIN_COSTS`, a small lookup table (`sorted`, `sort`, `min`, `max`, `sum`, `factorial`, `reversed`, etc.) checked only when the loop-based analysis found nothing (i.e. was about to report `O(1)`). This is a deterministic fix, not an AI call — the cost of these builtins is known, not ambiguous, so no tokens/AI needed for this class of bug.
- **Regression-tested against 12 algorithms**, all passing:

| Algorithm | Result |
|---|---|
| Binary search | O(log N) ✅ |
| Merge sort | O(N log N) ✅ |
| `math.factorial(n)` | O(N) ✅ (was O(1) before fix) |
| `sorted(arr)` | O(N log N) ✅ (was O(1) before fix) |
| Memoized Fibonacci (`@lru_cache`) | O(N) ✅ |
| C++ nested loop | O(N²) ✅ |
| Two-list nested loop (independent sizes) | O(M · N) ✅ |
| `len(arr)` alone | O(1) ✅ (confirms no false positives) |
| `sum()` inside an existing loop | O(N) ✅ (confirms override doesn't override correct results) |
| Quicksort (recursion + builtins) | O(N log N) ✅ (confirms recursion path unaffected) |
| Plain arithmetic, no builtins | O(1) ✅ |
| `max(arr)` | O(N) ✅ |

- **Bonus finding, not yet acted on:** in the `sorted()` test, the Groq AI explanation text independently identified the correct answer in its prose *before* this fix was applied — it explicitly said the O(1) structured result was wrong. This suggests a real future architecture opportunity: use disagreement between the deterministic analyzer and the AI's explanation as a signal to flag low-confidence results, rather than only trusting the structured field. Not built yet — worth discussing before deciding whether/how to implement.

## Known issues — handed to frontend (not fixed in this session)

- **"Failed to fetch" error when clicking Analyze in the running app.** Backend was confirmed running (`uvicorn main:app --reload`) during this session's testing via Swagger directly, so this is likely either: the frontend pointed at a wrong/stale backend URL, or a CORS/network issue specific to the frontend's fetch call. Needs frontend-side debugging (check the failed request's target URL in DevTools Network tab).
- **UI still shows "Add Gemini Key" button/label** — should be updated to reflect the Groq migration, or removed if the key is meant to be server-side only now (recommended, since client-supplied keys re-introduce the "key visible in browser" risk this session just fixed on the backend default).

## Environment setup (for anyone pulling this)

```bash
cd backend
pip install -r requirements.txt
# create backend/.env with:
# GROQ_API_KEY=your_key_here
# MODEL_NAME=openai/gpt-oss-20b
uvicorn main:app --reload
```

```bash
cd frontend
npm install
npm run dev
```