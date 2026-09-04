# ComplexityLens 

> **Real-Time Algorithm Complexity Inspector, Control Flow Visualizer & Empirical Benchmarking Engine**

ComplexityLens is a computer science platform that performs static AST code analysis, real-time asymptotic Big-O calculation, live CPU sandbox benchmarking, interactive Control Flow Graph (CFG) rendering, KaTeX mathematical typesetting, and AI-powered code optimization.

Designed for algorithm analysis.
---

## Key Features

### 1. Static AST & Asymptotic Complexity Analysis
- Parses code structure using Abstract Syntax Trees (AST) for **Python**, **C++**, and **Java**.
- Computes exact **Time Complexity** ($O(1)$, $O(\log N)$, $O(N)$, $O(N \log N)$, $O(N^2)$, $O(N^3)$, $O(2^N)$), **Best Case** ($\Omega$), and **Tight Bound** ($\Theta$).
- Calculates **Auxiliary Space Complexity** and SymPy-simplified **Step Formulas** (e.g., $T(N) = \frac{N(N-1)}{2}$).
- **Built-in Method Awareness**: Correctly detects algorithm costs hidden inside library functions (`sorted()`, `math.factorial()`, `min()`, `max()`).

### 2. Interactive Empirical Sandbox Benchmarking
- **Real CPU Execution**: Executes user code in a sandboxed runner against dynamic input sizes ($N = 10 \dots 50,000$).
- **High-Precision Timing**: Measures execution duration in nanoseconds using `time.perf_counter_ns()` across multiple trial iterations.
- **$R^2$ Regression Curve Fitting**: Computes Coefficient of Determination ($R^2$) to evaluate percentage confidence matching measured timing against theoretical Big-O curves (e.g., `99.2% match to O(N²)`).
- **Dual-Mode Visualizer**: Toggle between **Empirical Runtime (ms)** and **Theoretical Step Counts**.

### 3. Hierarchical AST Control Flow & Call Graph
- Built with **ReactFlow** featuring dynamic $X$-indentation for nested loop depths.
- **Animated Loopback Edges**: Curved dashed arrows (`Loop Iteration`) illustrating loop iterations and recursion.
- ** Graph-to-Code Click Synchronization**: Clicking any graph node automatically scrolls and highlights that line in the Monaco Code Editor.
- Custom color-coded node cards displaying line numbers (`L:4`), statement snippets, and complexity badges.

### 4. Monaco Editor Line Heatmap
- Embedded **Monaco Code Editor** with custom line decoration heatmaps:
  -  **Red Glow (`O(N²)` / `O(2^N)`)**: Inner high-cost loops and exponential recursion.
  -  **Amber Glow (`O(N)`)**: Outer linear loop structures.
  -  **Cyan Glow (`O(log N)`)**: Logarithmic partitioning steps.
  -  **Emerald Tint (`O(1)`)**: Constant-time statements.
- Developer typography with **JetBrains Mono** font and code ligatures enabled (`!=`, `==`, `<=`, `=>`).

### 5.  KaTeX Mathematical Typesetting
- Renders Big-O notation, $\Omega$, $\Theta$, step formulas, and line cost badges into mathematical equations ($T(N) = \frac{N(N-1)}{2} \in O(N^2)$) using **KaTeX**.

### 6. CS Lab Audit Report Export (Printable PDF)
- One-click PDF Lab Report generation (`window.print()`).
- Print-optimized stylesheet (`@media print`) that formats background colors, code blocks, complexity matrices, empirical benchmark tables, and line-cost annotations on clean white paper for lab submissions.

### 7. Gemini AI Optimization Engine
- Powered by **Gemini LLaMA/GPT models** (via OpenAI-compatible API) for real-time code bottleneck identification and refactoring suggestions.

---

## Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend UI** | React 18, Vite, TailwindCSS, Lucide Icons |
| **Code Editor** | `@monaco-editor/react` (JetBrains Mono, Custom Heatmap Line Decorations) |
| **Graph Engine** | `@xyflow/react` (ReactFlow), SVG Smoothstep Bezier Edges |
| **Data Viz** | Recharts (Responsive Line Charts, Dual Axis Bounds) |
| **Math Typesetting** | KaTeX (`katex`) |
| **Backend API** | Python 3.10+, FastAPI, Uvicorn, Pydantic, CORS Middleware |
| **Analysis Engine** | AST (Abstract Syntax Tree), SymPy (Symbolic Mathematics) |
| **AI Provider** | Gemini API (`Gemini-sdk` / `openai` client) |

---

## Project Structure

```
ComplexityLens/
├── backend/
│   ├── analyzer/
│   │   ├── __init__.py
│   │   ├── ai_explainer.py          # Gemini AI & Rule-based Explanation Engine
│   │   ├── cpp_java_analyzer.py      # C++ / Java Regex & Tree Complexity Inspector
│   │   ├── execution_benchmark.py   # Empirical Sandbox Runner & R² Curve Fitter
│   │   ├── python_analyzer.py       # Python AST Visitor & Graph Generator
│   │   └── sympy_solver.py          # Symbolic Math Simplifier for T(N)
│   ├── main.py                      # FastAPI REST API Endpoints
│   ├── requirements.txt             # Python Backend Dependencies
│   └── .env                         # Environment variables (Gemini_API_KEY)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIExplanationPanel.jsx
│   │   │   ├── CodeEditor.jsx        # Monaco Editor with Heatmap & Reveal Line
│   │   │   ├── ComplexityCards.jsx   # Pulsing Glow Summary Cards
│   │   │   ├── GraphVisualizer.jsx   # Interactive AST Flowchart Graph
│   │   │   ├── GrowthChart.jsx       # Benchmark Visualizer & N-Slider
│   │   │   ├── Header.jsx           # Controls Bar & Export Trigger
│   │   │   ├── LineCostTable.jsx     # Line-by-Line Cost Table
│   │   │   ├── MathView.jsx          # KaTeX LaTeX Equation Renderer
│   │   │   ├── OptimizationPanel.jsx # AI Refactored Code Viewer
│   │   │   └── ReportModal.jsx       # Printable PDF Lab Audit Report Modal
│   │   ├── App.jsx                  # Main Layout & State Orchestration
│   │   ├── index.css                # Glassmorphic Styles, Fonts & Print Rules
│   │   └── main.jsx
│   ├── index.html                   # Plus Jakarta Sans, JetBrains Mono & KaTeX CDN
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## Quickstart & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create backend/.env file with your Gemini API key
echo "Gemini_API_KEY=your_Gemini_api_key_here" > .env
echo "MODEL_NAME=openai/gpt-oss-20b" >> .env

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8008 --reload
```
Backend API server will start on `http://localhost:8008`.

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```
Frontend Web App will open on `http://localhost:5173`.

---

## API Reference

### `POST /api/analyze`
Analyzes code and returns asymptotic complexity metrics, line costs, AST graph nodes/edges, benchmark datasets, and AI explanation summaries.

**Request Body:**
```json
{
  "code": "def two_sum(nums, target):\n    n = len(nums)\n    for i in range(n):\n        for j in range(i + 1, n):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
  "language": "python"
}
```

**Response Sample:**
```json
{
  "time_complexity_o": "O(N²)",
  "time_complexity_omega": "Ω(1)",
  "time_complexity_theta": "Θ(N²)",
  "space_complexity": "O(1)",
  "formula_str": "T(N) = N*(N - 1)/2",
  "dominant_term": "N²",
  "is_live_execution": true,
  "curve_fit": {
    "best_fit_complexity": "O(N²)",
    "r2_score": 0.994,
    "fit_percentage": 99.4
  }
}
```

---

### `POST /api/benchmark`
Runs empirical timing for a custom $N_{max}$ range and number of trial iterations.

---

## Preset Algorithm Library

ComplexityLens ships with classic Computer Science Data Structures & Algorithms presets:
- **Two Sum (Nested Loop $O(N^2)$ vs Hash Map $O(N)$)**
- **Merge Sort ($O(N \log N)$)**
- **Binary Search ($O(\log N)$)**
- **Matrix Multiplication ($O(N^3)$)**
- **Recursive Fibonacci ($O(2^N)$)**
- **Bubble Sort ($O(N^2)$)**

---

## License
 Built under the MIT License.