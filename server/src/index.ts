import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { issuesRouter } from './routes/issues.js';
import { repositoriesRouter } from './routes/repositories.js';
import { analyzeRouter } from './routes/analyze.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { logger } from './utils/logger.js';
import { ModelProvider } from './services/ModelProvider.js';

const app = express();

// Security & Parsing Middleware
app.use(
  cors({
    origin: [config.clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());
app.use(rateLimiter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: ModelProvider.isConfigured(),
  });
});

// Mount Routes
app.use('/api/issues', issuesRouter);
app.use('/api/repositories', repositoriesRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/chat', analyzeRouter); // Also allow /api/chat directly

// Central Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  logger.info(`FirstCommit server running on http://localhost:${config.port}`);
  logger.info(`CORS configured for origin: ${config.clientOrigin}`);
});

export default app;
