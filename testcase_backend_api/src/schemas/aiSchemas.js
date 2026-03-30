const { z } = require('zod');

const generateBodySchema = z.object({
  projectId: z.string().uuid(),
  moduleId: z.string().uuid().optional(),
  inputText: z.string().min(10).max(20_000),
  model: z.string().max(200).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

module.exports = {
  generateBodySchema,
};
