const { z } = require('zod');

const registerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1).max(120).optional(),
  roleName: z.enum(['Admin', 'QA', 'Developer']).optional(),
});

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

module.exports = {
  registerBodySchema,
  loginBodySchema,
};
