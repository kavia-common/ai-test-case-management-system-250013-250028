const asyncHandler = require('express-async-handler');
const dashboardService = require('../services/dashboardService');

/**
 * PUBLIC_INTERFACE
 * Controller for dashboard endpoints.
 */
class DashboardController {
  projectSummary = asyncHandler(async (req, res) => {
    const summary = await dashboardService.getProjectDashboard(req.params.projectId);
    return res.status(200).json({ summary });
  });
}

module.exports = new DashboardController();
