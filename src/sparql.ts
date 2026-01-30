import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Load .env file from project root (next to package.json)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex);
    const value = trimmed.slice(eqIndex + 1);
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // .env file is optional if env vars are set another way
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example for reference.`
    );
  }
  return value;
}

export { requireEnv };

export const SPARQL_ENDPOINT = requireEnv("SPARQL_ENDPOINT");

export interface SparqlBinding {
  type: string;
  value: string;
  "xml:lang"?: string;
  datatype?: string;
}

export interface SparqlResults {
  head: { vars: string[] };
  results: { bindings: Record<string, SparqlBinding>[] };
}

export async function querySparql(query: string): Promise<SparqlResults> {
  const response = await fetch(SPARQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      Accept: "application/sparql-results+json",
    },
    body: query,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `SPARQL query failed (${response.status}): ${body.slice(0, 200)}`
    );
  }

  return (await response.json()) as SparqlResults;
}

/** Format a single SPARQL binding value as clean text */
function formatValue(val: SparqlBinding | undefined): string {
  if (!val) return "";
  // Just return the value — no angle brackets, no language tags
  return val.value;
}

/** Format SPARQL results as a readable text table */
export function formatResults(results: SparqlResults): string {
  const vars = results.head.vars;
  const bindings = results.results.bindings;

  if (bindings.length === 0) {
    return "No results.";
  }

  const rows = bindings.map((b) =>
    vars.map((v) => formatValue(b[v])).join(" | ")
  );

  return [`${vars.join(" | ")}`, "---", ...rows].join("\n");
}
