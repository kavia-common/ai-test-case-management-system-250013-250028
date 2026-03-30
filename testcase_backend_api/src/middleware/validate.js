const { BadRequestError } = require('./errorHandler');

/**
 * PUBLIC_INTERFACE
 * Validate request fields using provided Zod schemas.
 * @param {{ body?: any, query?: any, params?: any }} schemas
 */
function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.body) req.body = schemas.body.parse(req.body);
      return next();
    } catch (err) {
      if (err && err.name === 'ZodError') return next(err);
      return next(new BadRequestError('Invalid request'));
    }
  };
}

module.exports = {
  validate,
};
