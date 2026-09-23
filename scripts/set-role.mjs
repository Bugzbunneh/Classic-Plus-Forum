// Local dev tool: sets a profile's role directly, bypassing the app.
//
// Role changes are deliberately blocked everywhere except a direct
// `postgres` database connection (see guard_profile_changes in
// supabase/migrations/0004_fix_guards.sql) - that's what makes the very
// first owner bootstrap possible without opening a self-promotion hole for
// everyone else. This script IS that direct connection: it goes straight to
// Postgres through the pooler (not through PostgREST/RLS), the same way a
// migration does, so you can flip your own test account between
// member/admin/owner to check how the UI looks for each role.
//
// Never expose this capability through the running app itself.

import { readFileSync } from "node:fs";
import { Client } from "pg";

const VALID_ROLES = ["member", "admin", "owner"];
const args = process.argv.slice(2);

// `pnpm role:set` with no args uses TEST_USERNAME + TEST_ROLE from
// .env.local; `pnpm role:set <role>` overrides just the role; `pnpm role:set
// <username> <role>` overrides both.
let targetUsername;
let role;
if (args.length >= 2) {
  [targetUsername, role] = args;
} else if (args.length === 1) {
  targetUsername = process.env.TEST_USERNAME;
  role = args[0];
} else {
  targetUsername = process.env.TEST_USERNAME;
  role = process.env.TEST_ROLE;
}

if (!targetUsername || !VALID_ROLES.includes(role)) {
  console.error(`Usage: pnpm role:set                              (uses TEST_USERNAME + TEST_ROLE from .env.local)`);
  console.error(`       pnpm role:set <${VALID_ROLES.join("|")}>                     (uses TEST_USERNAME, overrides role)`);
  console.error(`       pnpm role:set <username> <${VALID_ROLES.join("|")}>`);
  if (!process.env.TEST_USERNAME) {
    console.error("(TEST_USERNAME is not set in .env.local)");
  }
  process.exit(1);
}

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Missing SUPABASE_DB_PASSWORD - is .env.local filled in?");
  process.exit(1);
}

let poolerUrl;
try {
  poolerUrl = readFileSync("supabase/.temp/pooler-url", "utf8").trim();
} catch {
  console.error(
    "Could not read supabase/.temp/pooler-url - run `pnpm exec supabase link` first.",
  );
  process.exit(1);
}

const { username: dbUser, hostname, port } = new URL(poolerUrl);

const client = new Client({
  host: hostname,
  port: Number(port) || 5432,
  user: dbUser,
  password,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const result = await client.query(
  "update public.profiles set role = $1 where username = $2 returning username, role",
  [role, targetUsername],
);

await client.end();

if (result.rowCount === 0) {
  console.error(`No profile found with username "${targetUsername}"`);
  process.exit(1);
}

console.log(`${result.rows[0].username} is now ${result.rows[0].role}`);
