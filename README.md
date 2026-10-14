<h1 align="center">
  <br>
  ComplexityLens
  <br>
</h1>

<h4 align="center">Real-Time Algorithm Complexity Inspector · AST Analysis · Empirical Benchmarking · AI-Powered Optimization</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

**ComplexityLens** is a full-stack computer science tool that performs static AST-based code analysis, computes asymptotic Big-O complexity in real time, runs empirical CPU sandbox benchmarks, visualizes Abstract Syntax Tree Control Flow Graphs, and provides AI-powered code optimization — all in a sleek, interactive web workspace.

> Designed for students, engineers, and educators who need to audit, understand, and optimize algorithm efficiency.

---

## Features

### 1. Static AST & Asymptotic Complexity Analysis
- Parses code structure using **Abstract Syntax Trees (AST)** for **Python 3**, **C++**, and **Java**.
- Computes exact **Time Complexity** — O(1), O(log N), O(N), O(N log N), O(N²), O(N³), O(2^N).
- Reports all three asymptotic bounds: **Big-O** (worst), **Omega Ω** (best), and **Theta Θ** (tight).
- Calculates **Auxiliary Space Complexity** and SymPy-simplified **Step Formulas** like T(N) = N(N-1)/2.
- **Built-in Method Awareness**: Detects hidden costs in `sorted()`, `math.factorial()`, `min()`, `max()`, `arr.pop(0)`, `item in list`, etc.

### 2. Empirical Sandbox Benchmarking
- **Real CPU Execution**: Executes code in an isolated subprocess runner over dynamic input sizes (N = 10 to 50,000).
- **High-Precision Timing**: Measures execution duration using `time.perf_counter_ns()` across multiple trial iterations.
- **R² Regression Curve Fitting**: Computes Coefficient of Determination (R²) to evaluate how well measured timing matches theoretical Big-O growth curves (e.g., `99.4% match to O(N²)`).
- **Dual-Mode Visualizer**: Toggle between **Empirical Runtime (ms)** and **Theoretical Step Count** views.

### 3. Interactive AST Control Flow Graph
- Built with **ReactFlow (`@xyflow/react`)** with dynamic X-indentation for nested loop depths.
- **Animated Loopback Edges**: Curved dashed arrows illustrating loop iterations and recursion branches.
- **Graph-to-Code Click Sync**: Clicking any graph node automatically scrolls and highlights that line in the Monaco Editor.
- Custom color-coded node cards with line numbers, statement snippets, and complexity badges.

### 4. Monaco Editor Line Heatmap
- Embedded **Monaco Code Editor** with custom line decoration heatmaps:
  - **Red Glow** — `O(N²)` / `O(2^N)`: Inner high-cost loops & exponential recursion.
  - **Amber Glow** — `O(N)`: Outer linear loop structures.
  - **Cyan Glow** — `O(log N)`: Logarithmic partitioning steps.
  - **Emerald Tint** — `O(1)`: Constant-time statements.
- **JetBrains Mono** font with code ligatures enabled (`!=`, `==`, `<=`, `=>`).

### 5. AI-Powered Optimization Engine
- Powered by **Google Gemini** (`google-genai`) for intelligent code analysis.
- Identifies performance bottlenecks and suggests algorithmic refactoring.
- Generates a complete **optimized refactored solution** with one-click **Apply to Editor**.
- Supports **AI chat** — ask follow-up questions about your algorithm's complexity.
- Falls back to a built-in rule-based engine if no API key is provided.

### 6. KaTeX Mathematical Typesetting
- Renders Big-O notation, Ω, Θ, step formulas, and line cost badges as beautiful math equations using **KaTeX**.
- Inline math throughout the UI: T(N) = N(N-1)/2 ∈ O(N²).

### 7. CS Lab Report Export (Printable PDF)
- One-click PDF Lab Report generation using `window.print()`.
- Print-optimized stylesheet (`@media print`) formatting code blocks, complexity matrices, empirical benchmark tables, and line-cost annotations on clean white paper.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 18, Vite 6, TailwindCSS 3, Lucide Icons |
| **Code Editor** | `@monaco-editor/react` — JetBrains Mono, Custom Heatmap Decorations |
| **Graph Engine** | `@xyflow/react` (ReactFlow) — SVG Smoothstep Bezier Edges |
| **Data Visualization** | Recharts — Responsive Line Charts, Dual Axis Bounds |
| **Math Typesetting** | KaTeX (`katex`) |
| **Backend API** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2, CORS Middleware |
| **Analysis Engine** | `ast` (Python built-in), SymPy (Symbolic Mathematics), NetworkX |
| **AI Provider** | Google Gemini (`google-genai`) |
| **Deployment** | Vercel (Frontend + Serverless API), Procfile (Backend) |

---

## Project Structure

```
ComplexityLens/
├── backend/                           # Python FastAPI Backend
│   ├── analyzer/
│   │   ├── __init__.py
│   │   ├── ai_explainer.py            # Gemini AI & Rule-based Explanation Engine
│   │   ├── cpp_java_analyzer.py       # C++ / Java Regex & Tree Complexity Inspector
│   │   ├── execution_benchmark.py     # Empirical Sandbox Runner & R² Curve Fitter
│   │   ├── python_analyzer.py         # Python AST Visitor & CFG Generator
│   │   └── sympy_solver.py            # Symbolic Math Simplifier for T(N)
│   ├── main.py                        # FastAPI REST API Endpoints
│   ├── Procfile                       # Backend server start command
│   └── requirements.txt              # Python Backend Dependencies
│
├── frontend/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIExplanationPanel.jsx     # Step-by-step AI complexity breakdown
│   │   │   ├── AlgorithmChatPanel.jsx     # Interactive AI chat about your code
│   │   │   ├── CodeEditor.jsx             # Monaco Editor + Heatmap Decorations
│   │   │   ├── ComplexityCards.jsx        # Big-O / Ω / Θ summary cards
│   │   │   ├── GraphVisualizer.jsx        # Interactive AST Control Flow Graph
│   │   │   ├── GrowthChart.jsx            # Benchmark Visualizer & N-Slider
│   │   │   ├── Header.jsx                 # Controls Bar & Export Trigger
│   │   │   ├── HomeNavbar.jsx             # Landing page navigation
│   │   │   ├── HomePage.jsx               # Landing page with interactive sandbox
│   │   │   ├── LineCostTable.jsx          # Line-by-Line Execution Cost Table
│   │   │   ├── MathView.jsx               # KaTeX LaTeX Equation Renderer
│   │   │   ├── OptimizationPanel.jsx      # AI Refactored Code Viewer
│   │   │   ├── ReportModal.jsx            # Printable PDF Lab Audit Report
│   │   │   └── ThemeToggle.jsx            # Dark / Light theme toggle
│   │   ├── utils/
│   │   │   └── localAnalyzer.js           # Client-side fallback analyzer
│   │   ├── App.jsx                        # Main Layout & State Orchestration
│   │   ├── index.css                      # Global styles & print rules
│   │   └── main.jsx
│   ├── index.html                         # Fonts (Plus Jakarta Sans, JetBrains Mono) & KaTeX CDN
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── api/
│   └── index.py                           # Vercel Serverless API Entry Point
├── vercel.json                            # Vercel deployment configuration
├── requirements.txt                       # Root-level Python dependencies (for Vercel)
└── .env                                   # Environment variables (not committed)
```

---

## Quickstart

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** & **npm**
- A **Google Gemini API Key** *(optional — the app works without one using the built-in analysis engine)*

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ComplexityLens.git
cd ComplexityLens
```

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Add your Gemini API key
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env

# Start the FastAPI development server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

> Backend API will be live at `http://localhost:8000`

---

### 3. Frontend Setup

```bash
# Open a new terminal, navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start the Vite development server
npm run dev
```

> Frontend will open at `http://localhost:5173`

---

### 4. Environment Variables

| Variable | Location | Description |
|---|---|---|
| `GEMINI_API_KEY` | `backend/.env` | Google Gemini API key for AI explanations & optimization |
| `VITE_API_BASE_URL` | `frontend/.env` | Backend API base URL (defaults to `localhost:8000` in dev, empty string in prod) |

> **Tip:** You can also enter your Gemini API key directly in the app's **Settings** panel in the UI — no `.env` file required.

---

## API Reference

### `POST /api/analyze`

Analyzes code and returns asymptotic complexity metrics, line-by-line costs, AST graph nodes/edges, empirical benchmark data, and AI explanation.

**Request Body:**
```json
{
  "code": "def two_sum(nums, target):\n    n = len(nums)\n    for i in range(n):\n        for j in range(i + 1, n):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
  "language": "python",
  "api_key": "optional_gemini_api_key"
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
  },
  "line_costs": {
    "3": { "cost": "O(N)", "frequency": "N" },
    "4": { "cost": "O(N²)", "frequency": "N*(N-1)/2" }
  },
  "graph": { "nodes": [...], "edges": [...] },
  "benchmark_data": [...],
  "ai_explanation": { ... }
}
```

---

### `POST /api/benchmark`

Runs empirical CPU timing for a given complexity class over a custom N range.

**Request Body:**
```json
{
  "time_complexity_o": "O(N²)",
  "max_n": 10000,
  "code": "optional_code_string",
  "language": "python",
  "num_trials": 3
}
```

---

### `POST /api/ai-explain`

Generates a standalone AI explanation for the provided code and its complexity metrics.

**Request Body:**
```json
{
  "code": "your_code_here",
  "language": "python",
  "time_complexity_o": "O(N²)",
  "space_complexity": "O(1)",
  "formula": "T(N) = N*(N-1)/2",
  "api_key": "optional_gemini_api_key"
}
```

---

### `POST /api/chat`

Sends a conversational message to the AI assistant in the context of your algorithm.

**Request Body:**
```json
{
  "code": "your_code_here",
  "language": "python",
  "time_complexity_o": "O(N²)",
  "space_complexity": "O(1)",
  "messages": [
    { "role": "user", "content": "Why is this O(N²) and not O(N)?" }
  ],
  "api_key": "optional_gemini_api_key"
}
```

---

### `GET /api/presets`

Returns the built-in algorithm code presets grouped by language (Python, C++, Java).

---

## Preset Algorithm Library

ComplexityLens ships with classic CS algorithm presets ready to load:

| Algorithm | Language | Time Complexity |
|---|---|---|
| Two Sum (Nested Loop) | Python | O(N²) |
| Merge Sort | Python | O(N log N) |
| Binary Search | Python | O(log N) |
| Matrix Multiplication | Python | O(N³) |
| Fibonacci Recursive | Python | O(2^N) |
| Bubble Sort | Python | O(N²) |
| Nested Loop Two Sum | C++ | O(N²) |
| Bitwise Divide Loop | C++ | O(log N) |
| Nested Loop Pair Print | Java | O(N²) |

---

## Deployment

The project is deployed on **Vercel** with the React frontend and a serverless Python API running together from a single repository.

### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "routes": [
    { "src": "/api/(.*)", "dest": "api/index.py" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Deploy Your Own Fork

1. **Fork** this repository.
2. **Connect** the repo to [Vercel](https://vercel.com).
3. Add `GEMINI_API_KEY` in **Vercel → Project → Settings → Environment Variables**.
4. Click **Deploy** — Vercel handles the build and routing automatically.

---

## Security & Privacy

- **No code is stored**: All submitted code is analyzed in-memory and discarded after the response.
- **API keys are never logged**: Keys passed via request body are used only for the active request.
- **Sandboxed execution**: Python benchmark runs occur in isolated `subprocess` calls with strict timeouts.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.

---

## License

This project is licensed under the **MIT License**.

---

<p align="center">
  Built with ❤️ &nbsp;·&nbsp; <strong>ComplexityLens</strong> — Real-Time Algorithmic &amp; Asymptotic Complexity Inspector
</p>
