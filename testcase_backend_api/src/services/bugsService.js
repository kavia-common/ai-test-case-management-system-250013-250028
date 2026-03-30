const { pool, withTransaction } = require('../db/pool');
const { NotFoundError } = require('../middleware/errorHandler');

/**
 * PUBLIC_INTERFACE
 * List bugs for a project.
 */
async function listBugs(projectId) {
  const { rows } = await pool.query(
    `SELECT id, project_id, title, description, status, severity, external_url, created_by, created_at, updated_at
     FROM bugs
     WHERE project_id = $1
     ORDER BY created_at DESC`,
    [projectId]
  );
  return rows;
}

/**
 * PUBLIC_INTERFACE
 * Create bug.
 */
async function createBug({ projectId, title, description, status, severity, externalUrl, createdBy, links }) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO bugs (project_id, title, description, status, severity, external_url, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, project_id, title, description, status, severity, external_url, created_by, created_at, updated_at`,
      [projectId, title, description || null, status || 'open', severity || 'medium', externalUrl || null, createdBy || null]
    );
    const bug = rows[0];

    if (Array.isArray(links)) {
      for (const link of links) {
        await client.query(
          `INSERT INTO bug_links (bug_id, testcase_id, execution_id, automation_run_id)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (bug_id, testcase_id) DO UPDATE SET
             execution_id = EXCLUDED.execution_id,
             automation_run_id = EXCLUDED.automation_run_id`,
          [bug.id, link.testcaseId, link.executionId || null, link.automationRunId || null]
        );
      }
    }

    return bug;
  });
}

/**
 * PUBLIC_INTERFACE
 * Update bug.
 */
async function updateBug(bugId, { title, description, status, severity, externalUrl }) {
  const { rows } = await pool.query(
    `UPDATE bugs
     SET title = COALESCE($2, title),
         description = COALESCE($3, description),
         status = COALESCE($4, status),
         severity = COALESCE($5, severity),
         external_url = COALESCE($6, external_url)
     WHERE id = $1
     RETURNING id, project_id, title, description, status, severity, external_url, created_by, created_at, updated_at`,
    [bugId, title || null, description || null, status || null, severity || null, externalUrl || null]
  );
  if (!rows[0]) throw new NotFoundError('Bug not found');
  return rows[0];
}

/**
 * PUBLIC_INTERFACE
 * List links for a bug.
 */
async function listBugLinks(bugId) {
  const { rows } = await pool.query(
    `SELECT bug_id, testcase_id, execution_id, automation_run_id, created_at
     FROM bug_links
     WHERE bug_id = $1
     ORDER BY created_at DESC`,
    [bugId]
  );
  return rows;
}

module.exports = {
  listBugs,
  createBug,
  updateBug,
  listBugLinks,
};
