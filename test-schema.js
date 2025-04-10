#!/usr/bin/env node

import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

console.log('ListTools method:', ListToolsRequestSchema.shape.method.value);
console.log('CallTool method:', CallToolRequestSchema.shape.method.value);