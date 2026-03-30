const { z } = require('zod');

const projectIdParamsSchema = z.object({
  projectId: z.string().uuid(),
});

const runIdParamsSchema = z.object({
  runId: z.string().uuid(),
});

const triggerRunBodySchema = z.object({
  moduleId: z.string().uuid().optional(),
  runType: z.string().max(50).optional(),
  metadata: z.any().optional(),
});

const addRunLogBodySchema = z.object({
  level: z.enum(['info', 'warn', 'error', 'debug']).optional(),
  message: z.string().min(1).max(2000),
  details: z.any().optional(),
});

const addArtifactBodySchema = z.object({
  testcaseId: z.string().uuid().optional(),
  artifactType: z.enum(['screenshot', 'video', 'trace', 'report', 'log']),
  fileName: z.string().min(1).max(300),
  contentType: z.string().max(200).optional(),
  storagePath: z.string().min(1).max(1000),
  sizeBytes: z.number().int().nonnegative().optional(),
  metadata: z.any().optional(),
});

module.exports = {
  projectIdParamsSchema,
  runIdParamsSchema,
  triggerRunBodySchema,
  addRunLogBodySchema,
  addArtifactBodySchema,
};
