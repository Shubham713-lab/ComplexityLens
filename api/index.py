import os
import sys

# Add root and backend directories to sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend_dir = os.path.join(root_dir, 'backend')

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from main import app
except Exception as err:
    from fastapi import FastAPI
    app = FastAPI(title="ComplexityLens Fallback API")

    @app.get("/api/health")
    def health():
        return {"status": "error", "message": str(err)}
