"""
AnythingAPI Python SDK

Usage:
    from anythingapi import AnythingAPI

    client = AnythingAPI(api_key="afa_sk_live_xxx")

    # Create workflow from natural language
    workflow = client.workflows.create(
        prompt="Get product price from any Amazon URL",
        test_input={"url": "https://amazon.com/dp/B09V3KXJPB"}
    )

    # Run workflow
    result = client.run("amazon-product-scraper", url="https://amazon.com/dp/B09V3KXJPB")
    print(result.title, result.price)
"""

from __future__ import annotations

import os
import time
from typing import Any, Optional

import httpx

from .types import (
    Workflow,
    WorkflowCreateParams,
    RunResult,
    RunResponse,
    ScheduleResponse,
)


class AnythingAPI:
    """Main client for the AnythingAPI platform."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "https://api.anythingapi.com/v1",
        timeout: float = 120.0,
    ):
        self.api_key = api_key or os.environ.get("ANYTHINGAPI_KEY", "")
        if not self.api_key:
            raise ValueError(
                "API key required. Pass api_key= or set ANYTHINGAPI_KEY env var."
            )

        self.base_url = base_url.rstrip("/")
        self._client = httpx.Client(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "anythingapi-python/0.1.0",
            },
            timeout=timeout,
        )

        # Sub-clients
        self.workflows = WorkflowsClient(self._client)
        self.runs = RunsClient(self._client)
        self.schedules = SchedulesClient(self._client)

    def run(
        self, workflow_slug: str, **input_data: Any
    ) -> RunResult:
        """
        Run a workflow synchronously (simplest usage).

        Example:
            result = client.run("amazon-scraper", url="https://amazon.com/dp/...")
            print(result.title, result.price)
        """
        resp = self._client.post(
            f"/run/{workflow_slug}",
            json=input_data,
        )
        resp.raise_for_status()
        data = resp.json()

        # Separate _meta from output
        meta = data.pop("_meta", {})
        return RunResult(output=data, meta=meta)

    def close(self):
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


class WorkflowsClient:
    """Manage workflows."""

    def __init__(self, client: httpx.Client):
        self._client = client

    def create(
        self,
        prompt: Optional[str] = None,
        name: Optional[str] = None,
        steps: Optional[list] = None,
        test_input: Optional[dict] = None,
    ) -> Workflow:
        """Create a workflow from natural language or manual steps."""
        mode = "ai" if prompt else "manual"
        body: dict[str, Any] = {"mode": mode}
        if prompt:
            body["prompt"] = prompt
        if name:
            body["name"] = name
        if steps:
            body["steps"] = steps
        if test_input:
            body["testInput"] = test_input

        resp = self._client.post("/workflows", json=body)
        resp.raise_for_status()
        return Workflow(**resp.json()["data"])

    def list(self, page: int = 1, per_page: int = 20) -> list[Workflow]:
        """List all workflows."""
        resp = self._client.get(
            "/workflows", params={"page": page, "perPage": per_page}
        )
        resp.raise_for_status()
        return [Workflow(**w) for w in resp.json()["data"]]

    def get(self, workflow_id: str) -> Workflow:
        """Get workflow details."""
        resp = self._client.get(f"/workflows/{workflow_id}")
        resp.raise_for_status()
        return Workflow(**resp.json()["data"])

    def delete(self, workflow_id: str) -> None:
        """Delete a workflow."""
        resp = self._client.delete(f"/workflows/{workflow_id}")
        resp.raise_for_status()


class RunsClient:
    """Execute workflows."""

    def __init__(self, client: httpx.Client):
        self._client = client

    def create(
        self,
        workflow: str,
        input: Optional[dict] = None,
        mode: str = "async",
        webhook_url: Optional[str] = None,
    ) -> RunResponse:
        """Create an async run."""
        body: dict[str, Any] = {
            "workflowSlug": workflow,
            "input": input or {},
            "mode": mode,
        }
        if webhook_url:
            body["webhookUrl"] = webhook_url

        resp = self._client.post("/runs", json=body)
        resp.raise_for_status()
        return RunResponse(**resp.json()["data"])

    def get(self, run_id: str) -> RunResponse:
        """Get run status and result."""
        resp = self._client.get(f"/runs/{run_id}")
        resp.raise_for_status()
        return RunResponse(**resp.json()["data"])

    def wait(self, run_id: str, poll_interval: float = 1.0, timeout: float = 300.0) -> RunResponse:
        """Poll until a run completes."""
        start = time.time()
        while time.time() - start < timeout:
            run = self.get(run_id)
            if run.status in ("completed", "failed", "cancelled"):
                return run
            time.sleep(poll_interval)
        raise TimeoutError(f"Run {run_id} did not complete within {timeout}s")

    def batch(
        self,
        workflow_id: str,
        inputs: list[dict],
        concurrency: int = 5,
        webhook_url: Optional[str] = None,
    ) -> dict:
        """Submit a batch of runs."""
        body: dict[str, Any] = {
            "workflowId": workflow_id,
            "inputs": inputs,
            "concurrency": concurrency,
        }
        if webhook_url:
            body["webhookUrl"] = webhook_url

        resp = self._client.post("/runs/batch", json=body)
        resp.raise_for_status()
        return resp.json()["data"]

    def cancel(self, run_id: str) -> None:
        """Cancel a running execution."""
        resp = self._client.post(f"/runs/{run_id}/cancel")
        resp.raise_for_status()


class SchedulesClient:
    """Manage scheduled runs."""

    def __init__(self, client: httpx.Client):
        self._client = client

    def create(
        self,
        workflow_id: str,
        cron: str,
        input: Optional[dict] = None,
        timezone: str = "UTC",
        webhook_url: Optional[str] = None,
    ) -> ScheduleResponse:
        """Create a scheduled run."""
        body: dict[str, Any] = {
            "workflowId": workflow_id,
            "cron": cron,
            "timezone": timezone,
            "input": input or {},
        }
        if webhook_url:
            body["webhookUrl"] = webhook_url

        resp = self._client.post("/schedules", json=body)
        resp.raise_for_status()
        return ScheduleResponse(**resp.json()["data"])

    def list(self) -> list[ScheduleResponse]:
        """List all schedules."""
        resp = self._client.get("/schedules")
        resp.raise_for_status()
        return [ScheduleResponse(**s) for s in resp.json()["data"]]

    def delete(self, schedule_id: str) -> None:
        """Delete a schedule."""
        resp = self._client.delete(f"/schedules/{schedule_id}")
        resp.raise_for_status()
