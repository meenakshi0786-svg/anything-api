"""Type definitions for the AnythingAPI SDK."""

from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel


class Workflow(BaseModel):
    id: str
    slug: str
    name: str
    description: Optional[str] = None
    version: Optional[int] = None
    endpoint: Optional[str] = None
    input_schema: Optional[dict] = None
    output_schema: Optional[dict] = None
    steps_count: Optional[int] = None
    is_active: Optional[bool] = None
    usage_count: Optional[int] = None
    avg_runtime_ms: Optional[int] = None
    success_rate: Optional[float] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    status: Optional[str] = None
    message: Optional[str] = None
    test_result: Optional[dict] = None

    model_config = {"populate_by_name": True, "extra": "allow"}


class RunResult:
    """Result from a sync workflow run."""

    def __init__(self, output: dict, meta: Optional[dict] = None):
        self._output = output
        self._meta = meta or {}

    def __getattr__(self, name: str) -> Any:
        if name.startswith("_"):
            raise AttributeError(name)
        if name in self._output:
            return self._output[name]
        raise AttributeError(f"No field '{name}' in result")

    def __repr__(self) -> str:
        return f"RunResult({self._output})"

    @property
    def run_id(self) -> Optional[str]:
        return self._meta.get("run_id")

    @property
    def runtime_ms(self) -> Optional[int]:
        return self._meta.get("runtime_ms")

    def to_dict(self) -> dict:
        return {**self._output, "_meta": self._meta}


class RunResponse(BaseModel):
    """Response from an async run."""
    id: Optional[str] = None
    run_id: Optional[str] = None
    status: str
    workflow_id: Optional[str] = None
    mode: Optional[str] = None
    input: Optional[dict] = None
    output: Optional[dict] = None
    error: Optional[dict] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    runtime_ms: Optional[int] = None
    poll_url: Optional[str] = None
    estimated_runtime_ms: Optional[int] = None

    model_config = {"populate_by_name": True, "extra": "allow"}


class ScheduleResponse(BaseModel):
    id: str
    workflow_id: Optional[str] = None
    cron: Optional[str] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None
    last_run_at: Optional[str] = None
    next_run_at: Optional[str] = None
    created_at: Optional[str] = None

    model_config = {"populate_by_name": True, "extra": "allow"}
