# MCP Server for SearxNG n8n Integration

A Model Context Protocol (MCP) server specifically designed for using SearxNG with n8n workflows.

## Usage in n8n

1.  **Prerequisites:**
    *   A running n8n instance.
    *   Access to a SearxNG instance (e.g., `https://your-searxng-instance.com`).
    *   The `n8n-nodes-mcp` package installed in your n8n instance.

2.  **Configure MCP Node in n8n:**
    *   Add an "MCP" node to your workflow.
    *   In the node settings, configure the server connection:
        *   **Command:** `npx`
        *   **Arguments:** `-y mcp-server-searxng-n8n --instance=https://your-searxng-instance.com` (Use your SearxNG URL. The package name assumes you publish as `mcp-server-searxng-n8n`.)
        *   **Environment Variables:** (Leave empty)

3.  **Using the Search Tool:**
    *   Once the connection is configured, select the **Tool Name:** `search` from the "Tool" dropdown.
    *   Configure the search parameters in the **Arguments** field using JSON format:
    ```
    {
        "q": "{{ $json.chatInput }}"
    }
    ```

## Available Search Parameters

The `search` tool supports the following parameters (only `q` is required):

-   `q` (required): The search query string
-   `categories`: Comma-separated list of search categories ("Web, "Images," "Videos," and "News," as well as the non-standard categories of "Social Media," "Music," "Files," "IT," and "Science.")
-   `engines`: Comma-separated list of search engines to use
-   `language`: Language code for the search
-   `time_range`: Time range for results (`day`, `month`, `year`)
-   `safesearch`: Safe search level (0: None, 1: Moderate, 2: Strict)
-   `image_proxy`: Proxy image results through SearxNG
-   `enabled_plugins`: Comma-separated list of enabled plugins
-   `disabled_plugins`: Comma-separated list of disabled plugins
-   `enabled_engines`: Comma-separated list of enabled engines
-   `disabled_engines`: Comma-separated list of disabled engines

## Example n8n Arguments (JSON for Arguments field)

```json
{
  "q": "n8n automation",
  "engines": "google,duckduckgo",
  "language": "en"
}
```
*(Remember to only include the parameters you need)*

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
