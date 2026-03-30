const express = require('express');

const healthController = require('../controllers/health');
const authController = require('../controllers/auth');
const projectsController = require('../controllers/projects');
const modulesController = require('../controllers/modules');
const tagsController = require('../controllers/tags');
const testcasesController = require('../controllers/testcases');
const executionsController = require('../controllers/executions');
const automationController = require('../controllers/automation');
const bugsController = require('../controllers/bugs');
const dashboardController = require('../controllers/dashboard');
const aiController = require('../controllers/ai');

const { requireAuth, requireRoles } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const { registerBodySchema, loginBodySchema } = require('../schemas/authSchemas');
const { createProjectBodySchema, updateProjectBodySchema, projectIdParamsSchema } = require('../schemas/projectsSchemas');
const { createModuleBodySchema, updateModuleBodySchema, projectIdParamsSchema: projectIdOnly, moduleIdParamsSchema } = require('../schemas/modulesSchemas');
const { createTagBodySchema } = require('../schemas/tagsSchemas');
const {
  projectIdParamsSchema: projectParamsForTC,
  testcaseIdParamsSchema,
  listTestcasesQuerySchema,
  createTestcaseBodySchema,
  updateTestcaseBodySchema,
} = require('../schemas/testcasesSchemas');
const {
  projectIdParamsSchema: projectParamsForExec,
  executionIdParamsSchema,
  listExecutionsQuerySchema,
  createExecutionBodySchema,
  addExecutionLogBodySchema,
} = require('../schemas/executionsSchemas');
const {
  projectIdParamsSchema: projectParamsForAuto,
  runIdParamsSchema,
  triggerRunBodySchema,
  addRunLogBodySchema,
  addArtifactBodySchema,
} = require('../schemas/automationSchemas');
const { projectIdParamsSchema: projectParamsForBugs, bugIdParamsSchema, createBugBodySchema, updateBugBodySchema } = require('../schemas/bugsSchemas');
const { generateBodySchema } = require('../schemas/aiSchemas');

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     description: Service health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health check passed
 */
router.get('/', healthController.check.bind(healthController));

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 */
router.post('/auth/register', validate({ body: registerBodySchema }), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 */
router.post('/auth/login', validate({ body: loginBodySchema }), authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/auth/me', requireAuth, authController.me);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: List projects
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Create project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/projects', requireAuth, projectsController.list);
router.post(
  '/projects',
  requireAuth,
  requireRoles(['Admin', 'QA']),
  validate({ body: createProjectBodySchema }),
  projectsController.create
);

/**
 * @swagger
 * /projects/{projectId}:
 *   patch:
 *     summary: Update project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 */
router.patch(
  '/projects/:projectId',
  requireAuth,
  requireRoles(['Admin', 'QA']),
  validate({ params: projectIdParamsSchema, body: updateProjectBodySchema }),
  projectsController.update
);
router.delete(
  '/projects/:projectId',
  requireAuth,
  requireRoles(['Admin']),
  validate({ params: projectIdParamsSchema }),
  projectsController.remove
);

/**
 * @swagger
 * /projects/{projectId}/modules:
 *   get:
 *     summary: List modules in project
 *     tags: [Modules]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Create module in project
 *     tags: [Modules]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/projects/:projectId/modules',
  requireAuth,
  validate({ params: projectIdOnly }),
  modulesController.listByProject
);
router.post(
  '/projects/:projectId/modules',
  requireAuth,
  requireRoles(['Admin', 'QA']),
  validate({ params: projectIdOnly, body: createModuleBodySchema }),
  modulesController.create
);

/**
 * @swagger
 * /modules/{moduleId}:
 *   patch:
 *     summary: Update module
 *     tags: [Modules]
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     summary: Delete module
 *     tags: [Modules]
 *     security: [{ bearerAuth: [] }]
 */
router.patch(
  '/modules/:moduleId',
  requireAuth,
  requireRoles(['Admin', 'QA']),
  validate({ params: moduleIdParamsSchema, body: updateModuleBodySchema }),
  modulesController.update
);
router.delete(
  '/modules/:moduleId',
  requireAuth,
  requireRoles(['Admin']),
  validate({ params: moduleIdParamsSchema }),
  modulesController.remove
);

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: List tags
 *     tags: [Tags]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Create tag
 *     tags: [Tags]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/tags', requireAuth, tagsController.list);
router.post('/tags', requireAuth, requireRoles(['Admin', 'QA']), validate({ body: createTagBodySchema }), tagsController.create);

/**
 * @swagger
 * /projects/{projectId}/testcases:
 *   get:
 *     summary: List testcases with filtering
 *     tags: [Testcases]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Create testcase
 *     tags: [Testcases]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/projects/:projectId/testcases',
  requireAuth,
  validate({ params: projectParamsForTC, query: listTestcasesQuerySchema }),
  testcasesController.listByProject
);
router.post(
  '/projects/:projectId/testcases',
  requireAuth,
  requireRoles(['Admin', 'QA']),
  validate({ params: projectParamsForTC, body: createTestcaseBodySchema }),
  testcasesController.create
);

/**
 * @swagger
 * /testcases/{testcaseId}:
 *   get:
 *     summary: Get testcase
 *     tags: [Testcases]
 *     security: [{ bearerAuth: [] }]
 *   patch:
 *     summary: Update testcase
 *     tags: [Testcases]
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     summary: Delete testcase
 *     tags: [Testcases]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/testcases/:testcaseId', requireAuth, validate({ params: testcaseIdParamsSchema }), testcasesController.get);
router.patch(
  '/testcases/:testcaseId',
  requireAuth,
  requireRoles(['Admin', 'QA']),
  validate({ params: testcaseIdParamsSchema, body: updateTestcaseBodySchema }),
  testcasesController.update
);
router.delete(
  '/testcases/:testcaseId',
  requireAuth,
  requireRoles(['Admin']),
  validate({ params: testcaseIdParamsSchema }),
  testcasesController.remove
);

/**
 * @swagger
 * /projects/{projectId}/executions:
 *   get:
 *     summary: List manual executions
 *     tags: [Executions]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Create manual execution
 *     tags: [Executions]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/projects/:projectId/executions',
  requireAuth,
  validate({ params: projectParamsForExec, query: listExecutionsQuerySchema }),
  executionsController.listByProject
);
router.post(
  '/projects/:projectId/executions',
  requireAuth,
  validate({ params: projectParamsForExec, body: createExecutionBodySchema }),
  executionsController.create
);

/**
 * @swagger
 * /executions/{executionId}/logs:
 *   get:
 *     summary: List execution logs
 *     tags: [Executions]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Add execution log
 *     tags: [Executions]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/executions/:executionId/logs',
  requireAuth,
  validate({ params: executionIdParamsSchema }),
  executionsController.logs
);
router.post(
  '/executions/:executionId/logs',
  requireAuth,
  validate({ params: executionIdParamsSchema, body: addExecutionLogBodySchema }),
  executionsController.addLog
);

/**
 * @swagger
 * /projects/{projectId}/automation/runs:
 *   get:
 *     summary: List automation runs
 *     tags: [Automation]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Trigger automation run (stub)
 *     tags: [Automation]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/projects/:projectId/automation/runs',
  requireAuth,
  validate({ params: projectParamsForAuto }),
  automationController.listByProject
);
router.post(
  '/projects/:projectId/automation/runs',
  requireAuth,
  requireRoles(['Admin', 'QA']),
  validate({ params: projectParamsForAuto, body: triggerRunBodySchema }),
  automationController.trigger
);

/**
 * @swagger
 * /automation/runs/{runId}/logs:
 *   get:
 *     summary: List automation logs
 *     tags: [Automation]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Add automation log
 *     tags: [Automation]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/automation/runs/:runId/logs',
  requireAuth,
  validate({ params: runIdParamsSchema }),
  automationController.logs
);
router.post(
  '/automation/runs/:runId/logs',
  requireAuth,
  validate({ params: runIdParamsSchema, body: addRunLogBodySchema }),
  automationController.addLog
);

/**
 * @swagger
 * /automation/runs/{runId}/artifacts:
 *   get:
 *     summary: List automation artifacts
 *     tags: [Automation]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Add automation artifact record
 *     tags: [Automation]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/automation/runs/:runId/artifacts',
  requireAuth,
  validate({ params: runIdParamsSchema }),
  automationController.artifacts
);
router.post(
  '/automation/runs/:runId/artifacts',
  requireAuth,
  validate({ params: runIdParamsSchema, body: addArtifactBodySchema }),
  automationController.addArtifact
);

/**
 * @swagger
 * /projects/{projectId}/bugs:
 *   get:
 *     summary: List bugs
 *     tags: [Bugs]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Create bug
 *     tags: [Bugs]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/projects/:projectId/bugs', requireAuth, validate({ params: projectParamsForBugs }), bugsController.listByProject);
router.post(
  '/projects/:projectId/bugs',
  requireAuth,
  requireRoles(['Admin', 'QA', 'Developer']),
  validate({ params: projectParamsForBugs, body: createBugBodySchema }),
  bugsController.create
);

/**
 * @swagger
 * /bugs/{bugId}:
 *   patch:
 *     summary: Update bug
 *     tags: [Bugs]
 *     security: [{ bearerAuth: [] }]
 */
router.patch(
  '/bugs/:bugId',
  requireAuth,
  requireRoles(['Admin', 'QA', 'Developer']),
  validate({ params: bugIdParamsSchema, body: updateBugBodySchema }),
  bugsController.update
);

/**
 * @swagger
 * /bugs/{bugId}/links:
 *   get:
 *     summary: List bug links
 *     tags: [Bugs]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/bugs/:bugId/links', requireAuth, validate({ params: bugIdParamsSchema }), bugsController.links);

/**
 * @swagger
 * /projects/{projectId}/dashboard/summary:
 *   get:
 *     summary: Project dashboard summary
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/projects/:projectId/dashboard/summary',
  requireAuth,
  validate({ params: projectIdParamsSchema }),
  dashboardController.projectSummary
);

/**
 * @swagger
 * /ai/generate:
 *   post:
 *     summary: Generate testcases from user story/prompt (stub)
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/ai/generate', requireAuth, validate({ body: generateBodySchema }), aiController.generate);

module.exports = router;
