const asyncHandler = require('express-async-handler');
const projectsService = require('../services/projectsService');

/**
 * PUBLIC_INTERFACE
 * Controller for project endpoints.
 */
class ProjectsController {
  list = asyncHandler(async (req, res) => {
    const rows = await projectsService.listProjects();
    return res.status(200).json({ projects: rows });
  });

  create = asyncHandler(async (req, res) => {
    const project = await projectsService.createProject({
      ...req.body,
      ownerUserId: req.user.id,
    });
    return res.status(201).json({ project });
  });

  update = asyncHandler(async (req, res) => {
    const project = await projectsService.updateProject(req.params.projectId, req.body);
    return res.status(200).json({ project });
  });

  remove = asyncHandler(async (req, res) => {
    const result = await projectsService.deleteProject(req.params.projectId);
    return res.status(200).json(result);
  });
}

module.exports = new ProjectsController();
