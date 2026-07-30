"""Utility module providing JSON response helper functions for FastAPI."""

from typing import Any
from fastapi.responses import JSONResponse


def jsonify(data: Any = None, status_code: int = 200, **kwargs) -> JSONResponse:
    """Return a FastAPI JSONResponse matching the Flask jsonify signature."""
    if data is None:
        data = kwargs
    elif isinstance(data, dict) and kwargs:
        data = {**data, **kwargs}
    return JSONResponse(content=data, status_code=status_code)
