const asyncHandler = require('express-async-handler');
const testcasesService = require('../services/testcasesService');

/**
 * PUBLIC_INTERFACE
 * Controller for testcase endpoints.
 */
class TestcasesController {
  listByProject = asyncHandler(async (req, res) => {
    const testcases = await testcasesService.listTestcases(req.params.projectId, req.query);
    return res.status(200).json({ testcases });
  });

  get = asyncHandler(async (req, res) => {
    const testcase = await testcasesService.getTestcase(req.params.testcaseId);
    return res.status(200).json({ testcase });
  });

  create = asyncHandler(async (req, res) => {
    const testcase = await testcasesService.createTestcase({
      projectId: req.params.projectId,
      ...req.body,
      createdBy: req.user.id,
    });
    return res.status(201).json({ testcase });
  });

  update = asyncHandler(async (req, res) => {
    const testcase = await testcasesService.updateTestcase(req.params.testcaseId, {
      ...req.body,
      updatedBy: req.user.id,
    });
    return res.status(200).json({ testcase });
  });

  remove = asyncHandler(async (req, res) => {
    const result = await testcasesService.deleteTestcase(req.params.testcaseId);
    return res.status(200).json(result);
  });
}

module.exports = new TestcasesController();
