"""
Runner script for the Python backend.
Usage:
    python run_backend.py
"""
import uvicorn

if __name__ == "__main__":
    print("Starting Jobs Dashboard Python Backend at http://127.0.0.1:8000 ...")
    print("API Documentation available at: http://127.0.0.1:8000/docs")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
