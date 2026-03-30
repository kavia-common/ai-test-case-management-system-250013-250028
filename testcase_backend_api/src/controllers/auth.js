const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');

/**
 * PUBLIC_INTERFACE
 * Controller for authentication endpoints.
 */
class AuthController {
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  });

  login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  });

  me = asyncHandler(async (req, res) => {
    const result = await authService.getMe(req.user.id);
    return res.status(200).json({ user: result });
  });
}

module.exports = new AuthController();
