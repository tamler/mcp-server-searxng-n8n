#!/usr/bin/env node

import { spawn } from 'child_process';
import { Buffer } from 'buffer';

// Create a new process running our MCP server
const serverProcess = spawn('npx', ['.'], {
  env: { ...process.env, SEARXNG_BASE_URL: 'https://your-searxng-instance.com' },
  stdio: ['pipe', 'pipe', 'inherit'] // stdin, stdout, stderr
});

// Helper to send MCP messages
function sendMessage(message) {
  const buffer = Buffer.from(JSON.stringify(message) + '\n');
  serverProcess.stdin.write(buffer);
}

// Helper to read MCP messages
function readMessage(callback) {
  let buffer = '';
  serverProcess.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    if (lines.length > 1) {
      buffer = lines.pop(); // Keep incomplete line
      lines.forEach(line => {
        if (line) {
          callback(JSON.parse(line));
        }
      });
    }
  });
}

// Test cases
const testCases = [
  {
    name: "Basic search",
    params: {
      q: "test query"
    }
  },
  {
    name: "Search with specific engines",
    params: {
      q: "test query",
      engines: "google,brave"
    }
  },
  {
    name: "Search with language and category",
    params: {
      q: "test query",
      language: "en",
      categories: "general"
    }
  },
  {
    name: "Search with time range and safe search",
    params: {
      q: "test query",
      time_range: "month",
      safesearch: 1
    }
  },
  {
    name: "Search with image proxy and plugins",
    params: {
      q: "test query",
      image_proxy: true,
      enabled_plugins: "Hash_plugin",
      disabled_plugins: "Vim-like_hotkeys"
    }
  }
];

// Test the server
async function runTest() {
  let currentTest = 0;
  
  // Listen for server responses
  readMessage((response) => {
    if (response.result?.tools) {
      console.log('Available tools:', JSON.stringify(response.result.tools, null, 2));
      console.log('\nStarting parameter tests...\n');
      runNextTest();
    } else {
      console.log(`\nResults for "${testCases[currentTest-1].name}":`);
      console.log(JSON.stringify(response, null, 2));
      if (currentTest < testCases.length) {
        setTimeout(runNextTest, 2000);
      } else {
        setTimeout(() => {
          console.log('\nAll tests complete, closing...');
          serverProcess.kill();
          process.exit(0);
        }, 1000);
      }
    }
  });

  // First, list available tools
  console.log('Listing tools...');
  sendMessage({
    jsonrpc: '2.0',
    id: '1',
    method: 'tools/list',
    params: {}
  });

  function runNextTest() {
    const test = testCases[currentTest];
    console.log(`\nRunning test: ${test.name}`);
    sendMessage({
      jsonrpc: '2.0',
      id: String(currentTest + 2),
      method: 'tools/call',
      params: {
        name: 'search',
        arguments: test.params
      }
    });
    currentTest++;
  }
}

runTest();