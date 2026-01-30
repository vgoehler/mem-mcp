# MEM Ontology MCP Server

An MCP (Model Context Protocol) server for querying the MEM (Metadata for Education Media) ontology, which models German school curricula across federal states (Bundesländer).

## Features

The server provides the following tools:

1. **`sparql_query`** — Execute arbitrary SPARQL SELECT queries against the MEM triple store
2. **`list_bundeslaender`** — List all German federal states available in the ontology
3. **`list_schulfaecher`** — List all school subjects for a given state
4. **`list_schularten`** — List all school types for a given state
5. **`find_lehrplaene`** — Find curricula by state, optionally filtered by subject, school type, or grade level
6. **`get_lehrplan_tree`** — Get the hierarchical structure of a Lehrplan (bounded by `depth`, default 2, max 10)
7. **`get_children`** — Get direct children of a specific node (for drilling down into a branch)
8. **`search`** — Full-text search across all Lehrplan nodes by keyword (uses Virtuoso `bif:contains`), with optional Bundesland filter

## Installation

```bash
npm install
npm run build
```

## Configuration

### Environment Variables

All configuration is via a `.env` file in the project root (loaded automatically at startup). Copy the example and edit as needed:

```bash
cp .env.example .env
```

The server will fail at startup if required variables are missing.

**Infrastructure graphs** (required):

| Variable | Description |
|----------|-------------|
| `SPARQL_ENDPOINT` | SPARQL endpoint URL |
| `GRAPH_ONTOLOGY` | Ontology graph URI |
| `GRAPH_SCHULART` | Schulart graph URI |
| `GRAPH_SCHULFACH` | Schulfach graph URI |

**State graphs** (optional, add one per state):

| Variable | Description |
|----------|-------------|
| `GRAPH_STATE_<CODE>` | Graph URI for a state, e.g. `GRAPH_STATE_SN`, `GRAPH_STATE_BY` |

State graphs are discovered dynamically — adding a new state requires only a new `GRAPH_STATE_<CODE>` entry in `.env`.

### For Claude Code

Add a `.mcp.json` file in the project root:

```json
{
  "mcpServers": {
    "mem-ontology": {
      "type": "stdio",
      "command": "node",
      "args": ["build/index.js"]
    }
  }
}
```

### For Claude Desktop

Add to your MCP settings configuration file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mem-ontology": {
      "command": "node",
      "args": ["/absolute/path/to/mem-ontologie-mcp/build/index.js"]
    }
  }
}
```

## Usage Examples

### Find biology curricula for Gymnasium in Sachsen
```
Tool: find_lehrplaene
Arguments: { "bundesland": "SN", "schulfach": "Biologie", "schulart": "Gymnasium" }
```

### Browse the curriculum tree (depth-limited)
```
Tool: get_lehrplan_tree
Arguments: { "lehrplanUri": "https://lp-sachsen.org/resource/522", "depth": 2 }
```

### Drill into a specific node
```
Tool: get_children
Arguments: { "nodeUri": "https://lp-sachsen.org/resource/7052" }
```

### Search for a topic across all states
```
Tool: search
Arguments: { "query": "Wirbeltiere" }
```

### Search within a specific state
```
Tool: search
Arguments: { "query": "Fische", "bundesland": "SN" }
```

## State Codes

- **BW** — Baden-Württemberg
- **BY** — Bayern
- **BE** — Berlin
- **BB** — Brandenburg
- **HB** — Bremen
- **HH** — Hamburg
- **HE** — Hessen
- **MV** — Mecklenburg-Vorpommern
- **NI** — Niedersachsen
- **NW** — Nordrhein-Westfalen
- **RP** — Rheinland-Pfalz
- **SL** — Saarland
- **SN** — Sachsen
- **ST** — Sachsen-Anhalt
- **SH** — Schleswig-Holstein
- **TH** — Thüringen

**Note:** Currently, curriculum data is available for **BY** (Bayern), **SN** (Sachsen), and **RP** (Rheinland-Pfalz).

## Architecture

- **Transport:** stdio (local MCP server)
- **SDK:** `@modelcontextprotocol/sdk` with `McpServer` and `zod` schemas
- **Data source:** SPARQL endpoint (configurable via `SPARQL_ENDPOINT` env var)
- **Runtime:** Node.js, TypeScript, ES modules

Source files:
- `src/index.ts` — Main MCP server with all tool registrations
- `src/sparql.ts` — SPARQL query execution and result formatting

## Development

```bash
npm run build    # Compile TypeScript
npm start        # Run the server
```

## License

Unlicense
