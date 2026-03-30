const { z } = require('zod');

const projectIdParamsSchema = z.object({
  projectId: z.string().uuid(),
});

const moduleIdParamsSchema = z.object({
  moduleId: z.string().uuid(),
});

const createModuleBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const updateModuleBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

module.exports = {
  projectIdParamsSchema,
  moduleIdParamsSchema,
  createModuleBodySchema,
  updateModuleBodySchema,
};
