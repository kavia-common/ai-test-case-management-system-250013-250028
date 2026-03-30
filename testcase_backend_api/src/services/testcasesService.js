const { pool, withTransaction } = require('../db/pool');
const { NotFoundError } = require('../middleware/errorHandler');

function buildWhere({ projectId, moduleId, status, priority, q }) {
  const clauses = [];
  const params = [];
  let idx = 1;

  clauses.push(`t.project_id = $${idx++}`);
  params.push(projectId);

  if (moduleId) {
    clauses.push(`t.module_id = $${idx++}`);
    params.push(moduleId);
  }
  if (status) {
    clauses.push(`t.status = $${idx++}`);
    params.push(status);
  }
  if (priority) {
    clauses.push(`t.priority = $${idx++}`);
    params.push(priority);
  }
  if (q) {
    clauses.push(`(t.title ILIKE $${idx} OR t.description ILIKE $${idx})`);
    params.push(`%${q}%`);
    idx++;
  }

  return { whereSql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params, nextIndex: idx };
}

async function getTagsForTestcaseIds(testcaseIds) {
  if (testcaseIds.length === 0) return {};
  const { rows } = await pool.query(
    `SELECT tt.testcase_id, tg.id, tg.name, tg.color
     FROM testcase_tags tt
     JOIN tags tg ON tg.id = tt.tag_id
     WHERE tt.testcase_id = ANY($1::uuid[])`,
    [testcaseIds]
  );

  const map = {};
  for (const row of rows) {
    if (!map[row.testcase_id]) map[row.testcase_id] = [];
    map[row.testcase_id].push({ id: row.id, name: row.name, color: row.color });
  }
  return map;
}

/**
 * PUBLIC_INTERFACE
 * List testcases for a project with optional filters.
 */
async function listTestcases(projectId, filters) {
  const { moduleId, status, priority, q, tagIds, tagNames } = filters;
  const { whereSql, params } = buildWhere({ projectId, moduleId, status, priority, q });

  // For tags filtering we can JOIN, but we do a simple approach:
  // First select cases, then filter by tags in-memory if tag filters are present.
  const { rows } = await pool.query(
    `SELECT t.id, t.project_id, t.module_id, t.title, t.description, t.preconditions,
            t.steps, t.expected, t.priority, t.status, t.created_by, t.updated_by,
            t.created_at, t.updated_at
     FROM testcases t
     ${whereSql}
     ORDER BY t.updated_at DESC`,
    params
  );

  const tagsMap = await getTagsForTestcaseIds(rows.map((r) => r.id));

  let result = rows.map((r) => ({ ...r, tags: tagsMap[r.id] || [] }));

  if (tagIds && tagIds.length) {
    const set = new Set(tagIds);
    result = result.filter((tc) => tc.tags.some((t) => set.has(t.id)));
  }
  if (tagNames && tagNames.length) {
    const set = new Set(tagNames.map((n) => n.toLowerCase()));
    result = result.filter((tc) => tc.tags.some((t) => set.has(t.name.toLowerCase())));
  }

  return result;
}

/**
 * PUBLIC_INTERFACE
 * Get testcase by id.
 */
async function getTestcase(testcaseId) {
  const { rows } = await pool.query(
    `SELECT id, project_id, module_id, title, description, preconditions, steps, expected,
            priority, status, created_by, updated_by, created_at, updated_at
     FROM testcases WHERE id = $1`,
    [testcaseId]
  );
  if (!rows[0]) throw new NotFoundError('Testcase not found');
  const tagsMap = await getTagsForTestcaseIds([testcaseId]);
  return { ...rows[0], tags: tagsMap[testcaseId] || [] };
}

/**
 * PUBLIC_INTERFACE
 * Create testcase and optional tags.
 */
async function createTestcase({ projectId, moduleId, title, description, preconditions, steps, expected, priority, status, createdBy, tagIds }) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO testcases
       (project_id, module_id, title, description, preconditions, steps, expected, priority, status, created_by, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10)
       RETURNING id, project_id, module_id, title, description, preconditions, steps, expected,
                 priority, status, created_by, updated_by, created_at, updated_at`,
      [
        projectId,
        moduleId || null,
        title,
        description || null,
        preconditions || null,
        JSON.stringify(steps || []),
        expected || null,
        priority || 'medium',
        status || 'active',
        createdBy || null,
      ]
    );

    const testcase = rows[0];

    if (tagIds && tagIds.length) {
      for (const tagId of tagIds) {
        await client.query(
          `INSERT INTO testcase_tags (testcase_id, tag_id)
           VALUES ($1, $2)
           ON CONFLICT (testcase_id, tag_id) DO NOTHING`,
          [testcase.id, tagId]
        );
      }
    }

    const full = await getTestcase(testcase.id);
    return full;
  });
}

/**
 * PUBLIC_INTERFACE
 * Update testcase fields and tags.
 */
async function updateTestcase(testcaseId, { title, description, preconditions, steps, expected, priority, status, moduleId, updatedBy, tagIds }) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE testcases
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           preconditions = COALESCE($4, preconditions),
           steps = COALESCE($5, steps),
           expected = COALESCE($6, expected),
           priority = COALESCE($7, priority),
           status = COALESCE($8, status),
           module_id = COALESCE($9, module_id),
           updated_by = COALESCE($10, updated_by)
       WHERE id = $1
       RETURNING id`,
      [
        testcaseId,
        title || null,
        description || null,
        preconditions || null,
        steps ? JSON.stringify(steps) : null,
        expected || null,
        priority || null,
        status || null,
        moduleId || null,
        updatedBy || null,
      ]
    );
    if (!rows[0]) throw new NotFoundError('Testcase not found');

    if (Array.isArray(tagIds)) {
      await client.query('DELETE FROM testcase_tags WHERE testcase_id = $1', [testcaseId]);
      for (const tagId of tagIds) {
        await client.query(
          `INSERT INTO testcase_tags (testcase_id, tag_id)
           VALUES ($1, $2)
           ON CONFLICT (testcase_id, tag_id) DO NOTHING`,
          [testcaseId, tagId]
        );
      }
    }

    const full = await getTestcase(testcaseId);
    return full;
  });
}

/**
 * PUBLIC_INTERFACE
 * Delete testcase.
 */
async function deleteTestcase(testcaseId) {
  const result = await pool.query('DELETE FROM testcases WHERE id = $1', [testcaseId]);
  if (result.rowCount === 0) throw new NotFoundError('Testcase not found');
  return { deleted: true };
}

module.exports = {
  listTestcases,
  getTestcase,
  createTestcase,
  updateTestcase,
  deleteTestcase,
};
