# @pipeworx/hal-fr

[HAL](https://hal.science) MCP — Hyper Articles en Ligne, the French national open archive of research output. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search(query, fl?, fq?, rows?, start?, sort?)` — Solr-style search across HAL
- `get(hal_id)` — single document by HAL id (e.g. "hal-00001234")
- `author(name|id)` — author lookup
- `structure(query)` — research structure (lab/department) lookup

## Data source

`https://api.archives-ouvertes.fr/search/` (Solr-backed REST).

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "hal-fr": {
      "url": "https://gateway.pipeworx.io/hal-fr/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Hal Fr data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
