# API for Anything — MCP Server

Exposes your **API for Anything** workflows as MCP tools to Claude Desktop, Cursor, Windsurf, and any other MCP-compatible AI client.

## Quick Setup

### 1. Get an API key

Go to https://your-deployment.com/settings → API Keys → Create Key.

### 2. Add to Claude Desktop / Cursor

Edit your MCP config file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "anything-api": {
      "command": "npx",
      "args": ["-y", "@afa/mcp-server"],
      "env": {
        "AFA_API_KEY": "afa_sk_live_xxxxx",
        "AFA_API_URL": "http://localhost:3001"
      }
    }
  }
}
```

### 3. Restart Claude/Cursor

Your workflows will now appear as tools. The AI can call them with structured arguments and receive structured JSON results.

## How it works

- The MCP server reads your active workflows from the API
- Each workflow becomes a tool: `your_workflow_slug`
- The tool's input schema matches your workflow's `inputSchema`
- When called, it executes the workflow synchronously and returns the JSON output

## Available tools

- `list_workflows` — get all your available workflows + their schemas
- One tool per active workflow (named after its slug)

## Example

If you have a workflow called "amazon-product-scraper", Claude/Cursor can do:

```
> Get the price of https://amazon.com/dp/B09V3KXJPB

[Claude calls amazon_product_scraper({ url: "..." })]
[Returns structured JSON with title, price, etc.]
```
