const { z } = require('zod');

const projectIdParamsSchema = z.object({
  projectId: z.string().uuid(),
});

const bugIdParamsSchema = z.object({
  bugId: z.string().uuid(),
});

const createBugBodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  externalUrl: z.string().url().optional(),
  links: z
    .array(
      z.object({
        testcaseId: z.string().uuid(),
        executionId: z.string().uuid().optional(),
        automationRunId: z.string().uuid().optional(),
      })
    )
    .optional(),
});

const updateBugBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  externalUrl: z.string().url().optional(),
});

module.exports = {
  projectIdParamsSchema,
  bugIdParamsSchema,
  createBugBodySchema,
  updateBugBodySchema,
};
