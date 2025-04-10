# MCP Server for SearXNG n8n Integration

A Model Context Protocol (MCP) server specifically designed for using SearXNG with n8n workflows.

## Usage in n8n

1.  **Prerequisites:**

    - A running n8n instance.
    - Access to a SearXNG instance (e.g., `https://your-searxng-instance.com`).
    - The `n8n-nodes-mcp` package installed in your n8n instance.

2.  **Configure MCP Node (Server Connection):**

    - Add an "MCP" node to your workflow.
    - In the node settings, under the **Server Connection** section:
      - **Command:** `npx`
      - **Arguments (for npx):** `-y mcp-server-searxng-n8n --instance=https://your-searxng-instance.com`
        - Replace `https://your-searxng-instance.com` with your actual SearXNG URL.
      - **Environment Variables:** (Leave empty)

3.  **Configure MCP Node (Tool Operation):**
    - Still in the MCP node settings, under the **Operation** section:
      - **Tool Name:** Select `search` from the dropdown.
      - **Arguments (for the 'search' tool):** Enter a **JSON object** containing the parameters for your search. See examples below. You can use n8n expressions like `{{ $json.chatInput }}` as values within the JSON.

## Available Search Parameters (for Tool Arguments JSON)

The `search` tool supports the following parameters within the JSON object (only `q` is required):

- `q` (required): The search query string
- `categories`: Comma-separated list of search categories
- `engines`: Comma-separated list of search engines to use
- `language`: Language code for the search
- `time_range`: Time range for results (`day`, `month`, `year`)
- `safesearch`: Safe search level (0: None, 1: Moderate, 2: Strict)
- `image_proxy`: Proxy image results through SearXNG
- `enabled_plugins`: Comma-separated list of enabled plugins
- `disabled_plugins`: Comma-separated list of disabled plugins
- `enabled_engines`: Comma-separated list of enabled engines
- `disabled_engines`: Comma-separated list of disabled engines
- `format`: Output format (`json`, `csv`, `rss`, `html`). Defaults to `json`.

## Example n8n Tool Arguments (JSON)

**JSON Output (Default):**

```json
{
  "q": "n8n automation",
  "engines": "google,duckduckgo",
  "language": "en"
}
```

**HTML Output:**

```json
{
  "q": "n8n automation",
  "format": "html"
}
```

_(Remember to only include the parameters you need in the JSON)_

## Development

```bash
git clone https://github.com/tamler/mcp-server-searxng-n8n.git
cd mcp-server-searxng-n8n
npm install
npm run build
```

Test with:

```bash
# Note the double dash -- to pass arguments to the script via npm start
npm start -- --instance=https://your-searxng-instance.com
```

## License

MIT
