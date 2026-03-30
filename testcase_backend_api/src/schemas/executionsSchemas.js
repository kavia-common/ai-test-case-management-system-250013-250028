const { z } = require('zod');

const projectIdParamsSchema = z.object({
  projectId: z.string().uuid(),
});

const executionIdParamsSchema = z.object({
  executionId: z.string().uuid(),
});

const listExecutionsQuerySchema = z.object({
  testcaseId: z.string().uuid().optional(),
});

const createExecutionBodySchema = z.object({
  testcaseId: z.string().uuid(),
  status: z.enum(['passed', 'failed', 'blocked', 'skipped']),
  environment: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
  logs: z
    .array(
      z.object({
        level: z.enum(['info', 'warn', 'error', 'debug']).optional(),
        message: z.string().min(1).max(2000),
        details: z.any().optional(),
      })
    )
    .optional(),
});

const addExecutionLogBodySchema = z.object({
  level: z.enum(['info', 'warn', 'error', 'debug']).optional(),
  message: z.string().min(1).max(2000),
  details: z.any().optional(),
});

module.exports = {
  projectIdParamsSchema,
  executionIdParamsSchema,
  listExecutionsQuerySchema,
  createExecutionBodySchema,
  addExecutionLogBodySchema,
};
