const { pool } = require('../db/pool');

/**
 * PUBLIC_INTERFACE
 * Dashboard summary for a project: testcase counts, latest runs, bugs summary.
 */
async function getProjectDashboard(projectId) {
  const [{ rows: tcRows }, { rows: execRows }, { rows: bugRows }, { rows: autoRows }] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status='active')::int AS active,
         COUNT(*) FILTER (WHERE priority='critical')::int AS critical
       FROM testcases
       WHERE project_id = $1`,
      [projectId]
    ),
    pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM testcase_executions
       WHERE project_id = $1
       GROUP BY status`,
      [projectId]
    ),
    pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM bugs
       WHERE project_id = $1
       GROUP BY status`,
      [projectId]
    ),
    pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM automation_runs
       WHERE project_id = $1
       GROUP BY status`,
      [projectId]
    ),
  ]);

  const executionsByStatus = execRows.reduce((acc, r) => {
    acc[r.status] = r.count;
    return acc;
  }, {});
  const bugsByStatus = bugRows.reduce((acc, r) => {
    acc[r.status] = r.count;
    return acc;
  }, {});
  const automationByStatus = autoRows.reduce((acc, r) => {
    acc[r.status] = r.count;
    return acc;
  }, {});

  return {
    testcases: tcRows[0],
    executionsByStatus,
    bugsByStatus,
    automationByStatus,
  };
}

module.exports = {
  getProjectDashboard,
};
