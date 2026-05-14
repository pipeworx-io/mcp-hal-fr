interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * HAL (Hyper Articles en Ligne) MCP — French national open research archive.
 *
 * Auth: none. Docs: https://api.archives-ouvertes.fr/docs/
 */


const BASE = 'https://api.archives-ouvertes.fr';
const UA = 'pipeworx-mcp-hal-fr/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Solr-style search across HAL.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text or Solr query (e.g. "title_t:transformer").' },
        fl: { type: 'string', description: 'Comma-sep fields to return.' },
        fq: { type: 'string', description: 'Solr filter query.' },
        rows: { type: 'number', description: '1-10000 (default 25).' },
        start: { type: 'number', description: '0-based offset.' },
        sort: { type: 'string', description: 'e.g. "submittedDate_tdate desc"' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get',
    description: 'Single document by HAL id.',
    inputSchema: {
      type: 'object',
      properties: { hal_id: { type: 'string' } },
      required: ['hal_id'],
    },
  },
  {
    name: 'author',
    description: 'Author lookup (free-text query).',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        rows: { type: 'number', description: '1-1000 (default 25).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'structure',
    description: 'Research-structure (lab/department) lookup.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        rows: { type: 'number', description: '1-1000 (default 25).' },
      },
      required: ['query'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search': {
      const params = new URLSearchParams({
        q: reqStr(args, 'query', '"transformer"'),
        wt: 'json',
        rows: String(Math.min(10000, Math.max(1, (args.rows as number) ?? 25))),
        start: String(Math.max(0, (args.start as number) ?? 0)),
      });
      if (args.fl) params.set('fl', String(args.fl));
      if (args.fq) params.set('fq', String(args.fq));
      if (args.sort) params.set('sort', String(args.sort));
      return halGet(`/search/?${params}`);
    }
    case 'get': {
      const id = reqStr(args, 'hal_id', '"hal-01234567"');
      const params = new URLSearchParams({ q: `halId_s:${id}`, wt: 'json', rows: '1' });
      return halGet(`/search/?${params}`);
    }
    case 'author': {
      const params = new URLSearchParams({
        q: reqStr(args, 'query', '"Doe"'),
        wt: 'json',
        rows: String(Math.min(1000, Math.max(1, (args.rows as number) ?? 25))),
      });
      return halGet(`/ref/author/?${params}`);
    }
    case 'structure': {
      const params = new URLSearchParams({
        q: reqStr(args, 'query', '"INRIA"'),
        wt: 'json',
        rows: String(Math.min(1000, Math.max(1, (args.rows as number) ?? 25))),
      });
      return halGet(`/ref/structure/?${params}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function halGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HAL: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
