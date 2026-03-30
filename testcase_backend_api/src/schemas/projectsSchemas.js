const { z } = require('zod');

const createProjectBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

const updateProjectBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived']).optional(),
});

const projectIdParamsSchema = z.object({
  projectId: z.string().uuid(),
});

module.exports = {
  createProjectBodySchema,
  updateProjectBodySchema,
  projectIdParamsSchema,
};
