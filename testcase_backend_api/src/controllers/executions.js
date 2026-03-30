const asyncHandler = require('express-async-handler');
const executionsService = require('../services/executionsService');

/**
 * PUBLIC_INTERFACE
 * Controller for execution endpoints.
 */
class ExecutionsController {
  listByProject = asyncHandler(async (req, res) => {
    const executions = await executionsService.listExecutions(req.params.projectId, req.query);
    return res.status(200).json({ executions });
  });

  create = asyncHandler(async (req, res) => {
    const execution = await executionsService.createExecution({
      projectId: req.params.projectId,
      testcaseId: req.body.testcaseId,
      executedBy: req.user.id,
      status: req.body.status,
      environment: req.body.environment,
      notes: req.body.notes,
      startedAt: req.body.startedAt,
      finishedAt: req.body.finishedAt,
      logs: req.body.logs,
    });
    return res.status(201).json({ execution });
  });

  logs = asyncHandler(async (req, res) => {
    const logs = await executionsService.getExecutionLogs(req.params.executionId);
    return res.status(200).json({ logs });
  });

  addLog = asyncHandler(async (req, res) => {
    const log = await executionsService.addExecutionLog(req.params.executionId, req.body);
    return res.status(201).json({ log });
  });
}

module.exports = new ExecutionsController();
