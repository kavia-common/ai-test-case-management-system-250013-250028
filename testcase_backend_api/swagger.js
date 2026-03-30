const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Test Case Management API',
      version: '1.0.0',
      description:
        'REST API for AI-powered Test Case Management System (JWT auth + RBAC, projects/modules/testcases, executions, automation, bugs, dashboard, AI generation).',
    },
    tags: [
      { name: 'Health', description: 'Service health' },
      { name: 'Auth', description: 'Authentication and user profile' },
      { name: 'Projects', description: 'Project CRUD' },
      { name: 'Modules', description: 'Module CRUD' },
      { name: 'Tags', description: 'Tag management' },
      { name: 'Testcases', description: 'Test case CRUD and filtering' },
      { name: 'Executions', description: 'Manual execution history and logs' },
      { name: 'Automation', description: 'Automation runs, logs and artifacts (stub runner)' },
      { name: 'Bugs', description: 'Bug tracking linked to testcases/executions/runs' },
      { name: 'Dashboard', description: 'Aggregated reporting endpoints' },
      { name: 'AI', description: 'AI test generation endpoints (deterministic stub)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
