#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  McpError,
  ErrorCode,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from 'node-fetch';

// --- Argument Parsing ---
function getSearxngBaseUrl(): string {
  const args = process.argv.slice(2); // Skip node executable and script path
  let url: string | null = null;
  const instanceArgPrefix = '--instance=';

  for (const arg of args) {
    if (arg.startsWith(instanceArgPrefix)) {
      url = arg.substring(instanceArgPrefix.length);
      break; // Found it, stop looking
    }
  }

  if (!url) {
    console.error(`Error: Argument format must be --instance=<url>`);
    console.error("Example: npx mcp-server-searxng-n8n --instance=https://your-searxng-instance.com");
    process.exit(1); // Exit if argument is missing or malformed
  }
  return url;
}

const SEARXNG_BASE_URL = getSearxngBaseUrl();
// --- End Argument Parsing ---


// Tool definition for SearxNG search
const SEARXNG_SEARCH_TOOL: Tool = {
  name: 'search',
  description: 'Perform a search using SearxNG for automation workflows',
  inputSchema: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        description: 'The search query string'
      },
      categories: {
        type: 'string',
        description: 'Comma separated list of search categories'
      },
      engines: {
        type: 'string',
        description: 'Comma separated list of search engines to use'
      },
      language: {
        type: 'string',
        description: 'Language code for the search'
      },
      time_range: {
        type: 'string',
        description: 'Time range for search results',
        enum: ['day', 'month', 'year']
      },
      safesearch: {
        type: 'integer',
        description: 'Safe search level (0: None, 1: Moderate, 2: Strict)',
        enum: [0, 1, 2]
      },
      image_proxy: {
        type: 'boolean',
        description: 'Proxy image results through SearxNG'
      },
      enabled_plugins: {
        type: 'string',
        description: 'Comma-separated list of enabled plugins'
      },
      disabled_plugins: {
        type: 'string',
        description: 'Comma-separated list of disabled plugins'
      },
      enabled_engines: {
        type: 'string',
        description: 'Comma-separated list of enabled engines'
      },
      disabled_engines: {
        type: 'string',
        description: 'Comma-separated list of disabled engines'
      }
    },
    required: ['q']
  }
};

// Create server instance
const server = new Server(
  {
    name: 'searxng',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {
        search: SEARXNG_SEARCH_TOOL,
      },
    },
  }
);

// Handle tool listing requests
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [SEARXNG_SEARCH_TOOL],
}));

// Handle tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  if (request.params.name !== 'search') {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${request.params.name}`
    );
  }

  try {
    const searchUrl = new URL('/search', SEARXNG_BASE_URL);
    
    // Always set format to JSON
    searchUrl.searchParams.set('format', 'json');

    // Add all provided parameters to the search URL
    if (request.params.arguments) {
      Object.entries(request.params.arguments).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchUrl.searchParams.set(key, value.toString());
        }
      });
    }

    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      throw new Error(`SearxNG API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(data, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
});

// Error handling
server.onerror = (error) => console.error('[MCP Error]', error);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});

console.error(`SearxNG MCP Server running on stdio, using instance: ${SEARXNG_BASE_URL}`);
