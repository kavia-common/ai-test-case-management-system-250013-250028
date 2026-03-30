const { z } = require('zod');

const createTagBodySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().max(20).optional(),
});

module.exports = {
  createTagBodySchema,
};
