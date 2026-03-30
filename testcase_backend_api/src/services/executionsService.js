/* eslint quotes: "off" */
const { pool, withTransaction } = require('../db/pool');
const { NotFoundError } = require('../middleware/errorHandler');

/**
 * PUBLIC_INTERFACE
 * List executions for a project (optionally by testcase).
 */
async function listExecutions(projectId, { testcaseId }) {
  const params = [projectId];
  let where = 'WHERE e.project_id = $1';
  if (testcaseId) {
    params.push(testcaseId);
    where += ` AND e.testcase_id = $2`;
  }

  const { rows } = await pool.query(
    `SELECT e.id, e.project_id, e.testcase_id, e.executed_by, e.status, e.environment,
            e.notes, e.started_at, e.finished_at, e.created_at
     FROM testcase_executions e
     ${where}
     ORDER BY e.started_at DESC`,
    params
  );
  return rows;
}

/**
 * PUBLIC_INTERFACE
 * Create a new execution and optional initial log.
 */
async function createExecution({ projectId, testcaseId, executedBy, status, environment, notes, startedAt, finishedAt, logs }) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO testcase_executions
       (project_id, testcase_id, executed_by, status, environment, notes, started_at, finished_at)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,NOW()),$8)
       RETURNING id, project_id, testcase_id, executed_by, status, environment, notes, started_at, finished_at, created_at`,
      [projectId, testcaseId, executedBy || null, status, environment || null, notes || null, startedAt || null, finishedAt || null]
    );
    const execution = rows[0];

    if (Array.isArray(logs) && logs.length) {
      for (const log of logs) {
        await client.query(
          `INSERT INTO execution_logs (execution_id, level, message, details)
           VALUES ($1,$2,$3,$4)`,
          [execution.id, log.level || 'info', log.message, log.details ? JSON.stringify(log.details) : null]
        );
      }
    }

    return execution;
  });
}

/**
 * PUBLIC_INTERFACE
 * Get logs for an execution.
 */
async function getExecutionLogs(executionId) {
  const { rows } = await pool.query(
    `SELECT id, execution_id, level, message, details, created_at
     FROM execution_logs
     WHERE execution_id = $1
     ORDER BY created_at ASC`,
    [executionId]
  );
  return rows;
}

/**
 * PUBLIC_INTERFACE
 * Append a log entry to an execution.
 */
async function addExecutionLog(executionId, { level, message, details }) {
  const exists = await pool.query('SELECT 1 FROM testcase_executions WHERE id = $1', [executionId]);
  if (exists.rowCount === 0) throw new NotFoundError('Execution not found');

  const { rows } = await pool.query(
    `INSERT INTO execution_logs (execution_id, level, message, details)
     VALUES ($1,$2,$3,$4)
     RETURNING id, execution_id, level, message, details, created_at`,
    [executionId, level || 'info', message, details ? JSON.stringify(details) : null]
  );
  return rows[0];
}

module.exports = {
  listExecutions,
  createExecution,
  getExecutionLogs,
  addExecutionLog,
};
