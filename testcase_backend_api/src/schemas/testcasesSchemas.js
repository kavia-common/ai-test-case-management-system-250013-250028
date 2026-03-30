const { z } = require('zod');

const projectIdParamsSchema = z.object({
  projectId: z.string().uuid(),
});

const testcaseIdParamsSchema = z.object({
  testcaseId: z.string().uuid(),
});

const stepSchema = z.object({
  action: z.string().min(1),
  expected: z.string().min(1),
});

const listTestcasesQuerySchema = z.object({
  moduleId: z.string().uuid().optional(),
  status: z.enum(['active', 'deprecated']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  q: z.string().max(200).optional(),
  tagIds: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').filter(Boolean) : undefined)),
  tagNames: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').filter(Boolean) : undefined)),
});

const createTestcaseBodySchema = z.object({
  moduleId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  preconditions: z.string().max(5000).optional(),
  steps: z.array(stepSchema).optional(),
  expected: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['active', 'deprecated']).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

const updateTestcaseBodySchema = z.object({
  moduleId: z.string().uuid().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  preconditions: z.string().max(5000).optional(),
  steps: z.array(stepSchema).optional(),
  expected: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['active', 'deprecated']).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

module.exports = {
  projectIdParamsSchema,
  testcaseIdParamsSchema,
  listTestcasesQuerySchema,
  createTestcaseBodySchema,
  updateTestcaseBodySchema,
};
