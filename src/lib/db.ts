import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

// Fail loudly and early. Without this you get an opaque driver error on the
// first query instead of a message naming the actual problem.
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local, paste your Neon " +
      "pooled connection string, and restart the dev server."
  );
}

// neon() returns a tagged-template function. It talks to Neon over HTTP rather
// than holding a TCP socket, which is the right model for Vercel: each query is
// one self-contained request, so there is no connection to leak when the
// platform freezes or recycles a function instance mid-execution.
export const sql = neon(connectionString);