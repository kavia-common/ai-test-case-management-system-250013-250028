const asyncHandler = require('express-async-handler');
const bugsService = require('../services/bugsService');

/**
 * PUBLIC_INTERFACE
 * Controller for bugs endpoints.
 */
class BugsController {
  listByProject = asyncHandler(async (req, res) => {
    const bugs = await bugsService.listBugs(req.params.projectId);
    return res.status(200).json({ bugs });
  });

  create = asyncHandler(async (req, res) => {
    const bug = await bugsService.createBug({
      projectId: req.params.projectId,
      ...req.body,
      createdBy: req.user.id,
    });
    return res.status(201).json({ bug });
  });

  update = asyncHandler(async (req, res) => {
    const bug = await bugsService.updateBug(req.params.bugId, req.body);
    return res.status(200).json({ bug });
  });

  links = asyncHandler(async (req, res) => {
    const links = await bugsService.listBugLinks(req.params.bugId);
    return res.status(200).json({ links });
  });
}

module.exports = new BugsController();
