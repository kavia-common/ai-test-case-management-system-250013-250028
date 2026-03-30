const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize express app
const app = express();

app.use(helmet());

/**
 * CORS configuration
 * - In preview/prod, set ALLOWED_ORIGINS to a comma-separated list.
 * - In local dev, leaving it empty falls back to '*'.
 */
function parseCsvEnv(name) {
  return (process.env[name] || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

const allowedOrigins = parseCsvEnv('ALLOWED_ORIGINS');
const allowedMethods = parseCsvEnv('ALLOWED_METHODS');
const allowedHeaders = parseCsvEnv('ALLOWED_HEADERS');
const corsMaxAge = process.env.CORS_MAX_AGE ? Number(process.env.CORS_MAX_AGE) : undefined;

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : '*',
    methods: allowedMethods.length ? allowedMethods : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: allowedHeaders.length ? allowedHeaders : ['Content-Type', 'Authorization'],
    maxAge: Number.isFinite(corsMaxAge) ? corsMaxAge : undefined,
  })
);
app.set('trust proxy', true);

app.use(morgan('combined'));

app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host'); // may or may not include port
  let protocol = req.protocol; // http or https

  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
      (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${protocol}://${fullHost}`,
      },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON request body
app.use(express.json());

// Mount routes
app.use('/', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
