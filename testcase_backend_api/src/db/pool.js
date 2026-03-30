const { Pool } = require('pg');

/**
 * Build a pg Pool from environment variables. The database container provides:
 * POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT, POSTGRES_URL
 *
 * We prefer discrete env vars because POSTGRES_URL in the provided template
 * is a convenience URL and may not include credentials.
 */
function buildPoolConfigFromEnv() {
  const port = process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : undefined;

  // Default host is localhost within the same docker network / dev environment.
  // In kavia, services are typically reachable by localhost with forwarded port.
  const host = process.env.POSTGRES_HOST || 'localhost';

  return {
    host,
    port,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    max: process.env.PG_POOL_MAX ? Number(process.env.PG_POOL_MAX) : 10,
    idleTimeoutMillis: process.env.PG_IDLE_TIMEOUT_MS ? Number(process.env.PG_IDLE_TIMEOUT_MS) : 30_000,
    connectionTimeoutMillis: process.env.PG_CONN_TIMEOUT_MS ? Number(process.env.PG_CONN_TIMEOUT_MS) : 10_000,
  };
}

const pool = new Pool(buildPoolConfigFromEnv());

/**
 * PUBLIC_INTERFACE
 * Acquire a client and run the provided callback inside a SQL transaction.
 * Rolls back on error and always releases the client.
 * @param {(client: import('pg').PoolClient) => Promise<any>} fn
 * @returns {Promise<any>}
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Failed to rollback transaction', rollbackErr);
    }
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  withTransaction,
};
