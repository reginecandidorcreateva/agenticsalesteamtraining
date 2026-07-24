#!/usr/bin/env node
// Applies hand-written SQL migrations (lib/db/migrations/*.sql, in numeric order) to DATABASE_URL.
// Tracks what's already been applied in a schema_migrations table so it's safe to re-run.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "lib", "db", "migrations");

// Load DATABASE_URL from .env.local without adding a dotenv dependency.
const envPath = join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (checked .env.local). Nothing to migrate.");
  process.exit(1);
}

if (!existsSync(migrationsDir)) {
  console.log("No migrations directory yet — nothing to migrate.");
  process.exit(0);
}

const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
if (files.length === 0) {
  console.log("No migrations found yet — nothing to migrate.");
  process.exit(0);
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

try {
  await sql`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `;

  const applied = new Set((await sql`select filename from schema_migrations`).map((r) => r.filename));

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const script = readFileSync(join(migrationsDir, file), "utf8");
    console.log(`Applying ${file}...`);
    await sql.unsafe(script);
    await sql`insert into schema_migrations (filename) values (${file})`;
    ran++;
  }

  console.log(ran === 0 ? "Already up to date." : `Applied ${ran} migration(s).`);
} finally {
  await sql.end();
}
