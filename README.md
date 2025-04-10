# MCP Server for SearxNG n8n Integration

A Model Context Protocol (MCP) server specifically designed for using SearxNG with n8n workflows.

## Installation

This package is designed to be used with the n8n MCP node. Install it globally on your n8n server:

```bash
npm install -g mcp-server-searxng-n8n
```

## Usage in n8n

1. Set up a SearxNG instance or use an existing one
2. Install the MCP node in n8n
3. Configure the MCP node:
   - Command: `mcp-server-searxng-n8n`
   - Environment Variables:
     - Name: `SEARXNG_BASE_URL`
     - Value: Your SearxNG instance URL (e.g., "https://your-searxng-instance.com")

## Available Search Parameters

The search tool supports the following parameters:

- `q` (required): The search query string
- `categories`: Comma-separated list of search categories
- `engines`: Comma-separated list of search engines to use
- `language`: Language code for the search
- `time_range`: Time range for results (`day`, `month`, `year`)
- `safesearch`: Safe search level (0: None, 1: Moderate, 2: Strict)
- `image_proxy`: Proxy image results through SearxNG
- `enabled_plugins`: Comma-separated list of enabled plugins
- `disabled_plugins`: Comma-separated list of disabled plugins
- `enabled_engines`: Comma-separated list of enabled engines
- `disabled_engines`: Comma-separated list of disabled engines

## Development

```bash
git clone https://github.com/tamler/mcp-server-searxng-n8n.git
cd mcp-server-searxng-n8n
npm install
npm run build
```

Test with:
```bash
SEARXNG_BASE_URL="https://your-searxng-instance.com" npm start
```

## License

MIT