const asyncHandler = require('express-async-handler');
const automationService = require('../services/automationService');

/**
 * PUBLIC_INTERFACE
 * Controller for automation endpoints.
 */
class AutomationController {
  listByProject = asyncHandler(async (req, res) => {
    const runs = await automationService.listRuns(req.params.projectId);
    return res.status(200).json({ runs });
  });

  trigger = asyncHandler(async (req, res) => {
    const run = await automationService.triggerRun({
      projectId: req.params.projectId,
      moduleId: req.body.moduleId,
      triggeredBy: req.user.id,
      runType: req.body.runType,
      metadata: req.body.metadata,
    });
    return res.status(201).json({ run });
  });

  logs = asyncHandler(async (req, res) => {
    const logs = await automationService.getRunLogs(req.params.runId);
    return res.status(200).json({ logs });
  });

  addLog = asyncHandler(async (req, res) => {
    const log = await automationService.addRunLog(req.params.runId, req.body);
    return res.status(201).json({ log });
  });

  artifacts = asyncHandler(async (req, res) => {
    const artifacts = await automationService.listArtifacts(req.params.runId);
    return res.status(200).json({ artifacts });
  });

  addArtifact = asyncHandler(async (req, res) => {
    const artifact = await automationService.addArtifact(req.params.runId, req.body);
    return res.status(201).json({ artifact });
  });
}

module.exports = new AutomationController();
