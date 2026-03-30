const { pool, withTransaction } = require('../db/pool');
const { NotFoundError } = require('../middleware/errorHandler');

/**
 * PUBLIC_INTERFACE
 * List automation runs for a project.
 */
async function listRuns(projectId) {
  const { rows } = await pool.query(
    `SELECT id, project_id, module_id, triggered_by, run_type, status, started_at, finished_at,
            summary, metadata, created_at, updated_at
     FROM automation_runs
     WHERE project_id = $1
     ORDER BY created_at DESC`,
    [projectId]
  );
  return rows;
}

/**
 * PUBLIC_INTERFACE
 * Trigger (create) a new automation run. This is a stub that creates a queued run.
 */
async function triggerRun({ projectId, moduleId, triggeredBy, runType, metadata }) {
  const { rows } = await pool.query(
    `INSERT INTO automation_runs (project_id, module_id, triggered_by, run_type, status, metadata)
     VALUES ($1,$2,$3,$4,'queued',$5)
     RETURNING id, project_id, module_id, triggered_by, run_type, status, started_at, finished_at,
               summary, metadata, created_at, updated_at`,
    [projectId, moduleId || null, triggeredBy || null, runType || 'playwright', JSON.stringify(metadata || {})]
  );
  return rows[0];
}

/**
 * PUBLIC_INTERFACE
 * Get automation logs for a run.
 */
async function getRunLogs(runId) {
  const { rows } = await pool.query(
    `SELECT id, automation_run_id, level, message, details, created_at
     FROM automation_logs
     WHERE automation_run_id = $1
     ORDER BY created_at ASC`,
    [runId]
  );
  return rows;
}

/**
 * PUBLIC_INTERFACE
 * Append log to run.
 */
async function addRunLog(runId, { level, message, details }) {
  const exists = await pool.query('SELECT 1 FROM automation_runs WHERE id = $1', [runId]);
  if (exists.rowCount === 0) throw new NotFoundError('Automation run not found');

  const { rows } = await pool.query(
    `INSERT INTO automation_logs (automation_run_id, level, message, details)
     VALUES ($1,$2,$3,$4)
     RETURNING id, automation_run_id, level, message, details, created_at`,
    [runId, level || 'info', message, details ? JSON.stringify(details) : null]
  );
  return rows[0];
}

/**
 * PUBLIC_INTERFACE
 * List artifacts for a run.
 */
async function listArtifacts(runId) {
  const { rows } = await pool.query(
    `SELECT id, automation_run_id, testcase_id, artifact_type, file_name, content_type, storage_path,
            size_bytes, metadata, created_at
     FROM automation_artifacts
     WHERE automation_run_id = $1
     ORDER BY created_at DESC`,
    [runId]
  );
  return rows;
}

/**
 * PUBLIC_INTERFACE
 * Save an artifact record for a run.
 */
async function addArtifact(runId, { testcaseId, artifactType, fileName, contentType, storagePath, sizeBytes, metadata }) {
  return withTransaction(async (client) => {
    const exists = await client.query('SELECT 1 FROM automation_runs WHERE id = $1', [runId]);
    if (exists.rowCount === 0) throw new NotFoundError('Automation run not found');

    const { rows } = await client.query(
      `INSERT INTO automation_artifacts
       (automation_run_id, testcase_id, artifact_type, file_name, content_type, storage_path, size_bytes, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, automation_run_id, testcase_id, artifact_type, file_name, content_type, storage_path,
                 size_bytes, metadata, created_at`,
      [
        runId,
        testcaseId || null,
        artifactType,
        fileName,
        contentType || null,
        storagePath,
        sizeBytes || null,
        JSON.stringify(metadata || {}),
      ]
    );
    return rows[0];
  });
}

module.exports = {
  listRuns,
  triggerRun,
  getRunLogs,
  addRunLog,
  listArtifacts,
  addArtifact,
};
