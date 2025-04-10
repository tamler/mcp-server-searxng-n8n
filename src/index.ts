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
    description: "Arguments for the SearxNG search tool. The 'q' parameter is mandatory.", // Added schema description
    properties: {
      q: {
        type: 'string',
        description: 'The search query string (REQUIRED). Example: "n8n automation"' // Enhanced description
      },
      categories: {
        type: 'string',
        description: 'Optional: Comma separated list of search categories (e.g., "general,images")'
      },
      engines: {
        type: 'string',
        description: 'Optional: Comma separated list of search engines to use (e.g., "google,brave")'
      },
      language: {
        type: 'string',
        description: 'Optional: Language code for the search (e.g., "en", "de")'
      },
      time_range: {
        type: 'string',
        description: 'Optional: Time range for search results',
        enum: ['day', 'month', 'year']
      },
      safesearch: {
        type: 'integer',
        description: 'Optional: Safe search level (0: None, 1: Moderate, 2: Strict)',
        enum: [0, 1, 2]
      },
      image_proxy: {
        type: 'boolean',
        description: 'Optional: Proxy image results through SearxNG (true/false)'
      },
      enabled_plugins: {
        type: 'string',
        description: 'Optional: Comma-separated list of enabled plugins'
      },
      disabled_plugins: {
        type: 'string',
        description: 'Optional: Comma-separated list of disabled plugins'
      },
      enabled_engines: {
        type: 'string',
        description: 'Optional: Comma-separated list of enabled engines (overrides general engines list)'
      },
      disabled_engines: {
        type: 'string',
        description: 'Optional: Comma-separated list of disabled engines'
      }
    },
    required: ['q']
  }
};

// Create server instance
const server = new Server(
  {
    name: 'searxng',
    version: '0.1.1', // Ensure version matches package.json
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

  // Basic validation: Ensure 'q' is provided if arguments exist
  if (!request.params.arguments?.q) {
     throw new McpError(
      ErrorCode.InvalidParams,
      `Missing required argument: 'q'`
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
      // Try to get more specific error from SearxNG if possible
      let errorBody = `SearxNG API error: ${response.status} ${response.statusText}`;
      try {
        const errorJson: unknown = await response.json();
        // Type guard to check if errorJson is an object with a string message
        if (typeof errorJson === 'object' && errorJson !== null && 'message' in errorJson && typeof errorJson.message === 'string') {
           errorBody += ` - ${errorJson.message}`;
        }
      } catch (e) { /* Ignore if response body is not JSON */ }
      throw new Error(errorBody);
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
        text: `Error executing search: ${error instanceof Error ? error.message : String(error)}`
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
