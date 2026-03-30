const { pool } = require('../db/pool');
const { NotFoundError } = require('../middleware/errorHandler');

/**
 * PUBLIC_INTERFACE
 * List modules for a project.
 */
async function listModules(projectId) {
  const { rows } = await pool.query(
    `SELECT id, project_id, name, description, sort_order, created_at, updated_at
     FROM modules
     WHERE project_id = $1
     ORDER BY sort_order ASC, created_at DESC`,
    [projectId]
  );
  return rows;
}

/**
 * PUBLIC_INTERFACE
 * Create module in project.
 */
async function createModule(projectId, { name, description, sortOrder }) {
  const { rows } = await pool.query(
    `INSERT INTO modules (project_id, name, description, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING id, project_id, name, description, sort_order, created_at, updated_at`,
    [projectId, name, description || null, sortOrder || 0]
  );
  return rows[0];
}

/**
 * PUBLIC_INTERFACE
 * Update module.
 */
async function updateModule(moduleId, { name, description, sortOrder }) {
  const { rows } = await pool.query(
    `UPDATE modules
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         sort_order = COALESCE($4, sort_order)
     WHERE id = $1
     RETURNING id, project_id, name, description, sort_order, created_at, updated_at`,
    [moduleId, name || null, description || null, sortOrder ?? null]
  );
  if (!rows[0]) throw new NotFoundError('Module not found');
  return rows[0];
}

/**
 * PUBLIC_INTERFACE
 * Delete module.
 */
async function deleteModule(moduleId) {
  const result = await pool.query('DELETE FROM modules WHERE id = $1', [moduleId]);
  if (result.rowCount === 0) throw new NotFoundError('Module not found');
  return { deleted: true };
}

module.exports = {
  listModules,
  createModule,
  updateModule,
  deleteModule,
};
