#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadData } from './data.ts';
import { createServer } from './server.ts';

// stdout carries the MCP protocol: anything human-readable goes to stderr.
function parseRoot(argv: string[]): string | undefined {
  const i = argv.indexOf('--root');
  return i >= 0 ? argv[i + 1] : undefined;
}

try {
  const root = parseRoot(process.argv.slice(2));
  const data = loadData(root ? { root } : {});
  const server = createServer(data);
  await server.connect(new StdioServerTransport());
  console.error(`loui-ds MCP server ready (data: ${data.root})`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
