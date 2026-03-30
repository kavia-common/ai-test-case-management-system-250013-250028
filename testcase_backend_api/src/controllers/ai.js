const asyncHandler = require('express-async-handler');
const aiService = require('../services/aiService');

/**
 * PUBLIC_INTERFACE
 * Controller for AI endpoints.
 */
class AiController {
  generate = asyncHandler(async (req, res) => {
    const result = await aiService.generateTestcases({
      projectId: req.body.projectId,
      moduleId: req.body.moduleId,
      requestedBy: req.user.id,
      inputText: req.body.inputText,
      model: req.body.model,
      temperature: req.body.temperature,
    });
    return res.status(200).json(result);
  });
}

module.exports = new AiController();
