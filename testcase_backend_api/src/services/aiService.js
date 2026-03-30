const { pool } = require('../db/pool');

/**
 * Very small deterministic generator (no external LLM dependency).
 * Produces 3-5 test ideas based on input text.
 */
function generateFromStory(storyText) {
  const base = storyText.trim().slice(0, 120);
  return [
    { title: `Happy path: ${base}`, priority: 'high' },
    { title: `Validation errors: ${base}`, priority: 'medium' },
    { title: `Security/permissions: ${base}`, priority: 'high' },
    { title: `Edge cases: ${base}`, priority: 'medium' },
  ];
}

/**
 * PUBLIC_INTERFACE
 * Create an AI generation record and return generated testcases.
 */
async function generateTestcases({ projectId, moduleId, requestedBy, inputText, model, temperature }) {
  const generated = generateFromStory(inputText);

  const { rows } = await pool.query(
    `INSERT INTO ai_generations
     (project_id, module_id, requested_by, input_type, input_text, model, temperature, status, output)
     VALUES ($1,$2,$3,'user_story',$4,$5,$6,'completed',$7)
     RETURNING id, project_id, module_id, requested_by, input_type, input_text, model, temperature,
               status, error_message, output, created_at`,
    [projectId, moduleId || null, requestedBy || null, inputText, model || 'demo-model', temperature ?? null, JSON.stringify({ generated })]
  );

  return { generation: rows[0], generated };
}

module.exports = {
  generateTestcases,
};
