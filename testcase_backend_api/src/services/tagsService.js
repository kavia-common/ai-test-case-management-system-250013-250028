const { pool } = require('../db/pool');

/**
 * PUBLIC_INTERFACE
 * List tags.
 */
async function listTags() {
  const { rows } = await pool.query(
    `SELECT id, name, color, created_at
     FROM tags
     ORDER BY name ASC`
  );
  return rows;
}

/**
 * PUBLIC_INTERFACE
 * Create tag.
 */
async function createTag({ name, color }) {
  const { rows } = await pool.query(
    `INSERT INTO tags (name, color)
     VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color
     RETURNING id, name, color, created_at`,
    [name, color || null]
  );
  return rows[0];
}

module.exports = {
  listTags,
  createTag,
};
