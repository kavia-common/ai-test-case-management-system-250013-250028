const asyncHandler = require('express-async-handler');
const modulesService = require('../services/modulesService');

/**
 * PUBLIC_INTERFACE
 * Controller for module endpoints.
 */
class ModulesController {
  listByProject = asyncHandler(async (req, res) => {
    const modules = await modulesService.listModules(req.params.projectId);
    return res.status(200).json({ modules });
  });

  create = asyncHandler(async (req, res) => {
    const moduleRow = await modulesService.createModule(req.params.projectId, req.body);
    return res.status(201).json({ module: moduleRow });
  });

  update = asyncHandler(async (req, res) => {
    const moduleRow = await modulesService.updateModule(req.params.moduleId, req.body);
    return res.status(200).json({ module: moduleRow });
  });

  remove = asyncHandler(async (req, res) => {
    const result = await modulesService.deleteModule(req.params.moduleId);
    return res.status(200).json(result);
  });
}

module.exports = new ModulesController();
