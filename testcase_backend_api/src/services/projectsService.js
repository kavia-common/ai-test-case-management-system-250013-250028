const { pool } = require('../db/pool');
const { NotFoundError } = require('../middleware/errorHandler');

/**
 * PUBLIC_INTERFACE
 * List projects.
 */
async function listProjects() {
  const { rows } = await pool.query(
    `SELECT id, name, description, owner_user_id, status, created_at, updated_at
     FROM projects
     ORDER BY created_at DESC`
  );
  return rows;
}

/**
 * PUBLIC_INTERFACE
 * Create project.
 */
async function createProject({ name, description, ownerUserId }) {
  const { rows } = await pool.query(
    `INSERT INTO projects (name, description, owner_user_id, status)
     VALUES ($1, $2, $3, 'active')
     RETURNING id, name, description, owner_user_id, status, created_at, updated_at`,
    [name, description || null, ownerUserId || null]
  );
  return rows[0];
}

/**
 * PUBLIC_INTERFACE
 * Update project.
 */
async function updateProject(projectId, { name, description, status }) {
  const { rows } = await pool.query(
    `UPDATE projects
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         status = COALESCE($4, status)
     WHERE id = $1
     RETURNING id, name, description, owner_user_id, status, created_at, updated_at`,
    [projectId, name || null, description || null, status || null]
  );
  if (!rows[0]) throw new NotFoundError('Project not found');
  return rows[0];
}

/**
 * PUBLIC_INTERFACE
 * Delete project.
 */
async function deleteProject(projectId) {
  const result = await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);
  if (result.rowCount === 0) throw new NotFoundError('Project not found');
  return { deleted: true };
}

module.exports = {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
};
