require('dotenv').config();
const express = require('express');
const middlewareRoutes = require('./routes/middlewareDemo');
const { requestLogger, detailedLogger, performanceLogger } = require('./middleware/logger');
const {
  errorHandler,
  notFoundHandler,
  withTiming,
  throwError,
  requestId,
  corsMiddleware,
  staticHeaders
} = require('./middleware/utils');

const app = express();

console.log('Setting up middleware...\n');

app.use(corsMiddleware);
app.use(staticHeaders);
app.use(requestId);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);
app.use(performanceLogger(100));

app.use('/api', middlewareRoutes);

app.get('/demo/middleware-order', (req, res) => {
  res.json({
    message: 'Middleware execution order demonstration',
    note: 'Check console output to see middleware execution sequence',
    steps: [
      '1. corsMiddleware',
      '2. staticHeaders',
      '3. requestId',
      '4. express.json()',
      '5. requestLogger',
      '6. performanceLogger',
      '7. Route handler'
    ]
  });
});

app.get('/demo/error', throwError);

app.post('/demo/pipeline', (req, res) => {
  console.log('\n--- REQUEST/RESPONSE PIPELINE DEMO ---');
  console.log('1. Request received and parsed');
  console.log('2. Middleware chain executed');
  console.log('3. Route handler processing...');

  res.json({
    message: 'Request processed successfully',
    receivedData: req.body,
    requestId: req.id,
    note: 'Check console to see full pipeline execution'
  });
});

app.get('/api/documentation', (req, res) => {
  res.json({
    title: 'Express Middleware Demo API',
    description: 'Demonstrates logging, authentication, and middleware chaining',
    endpoints: {
      public: {
        'GET /api/health': 'Health check endpoint',
        'GET /api/tokens': 'Get test JWT tokens for authentication testing',
        'GET /api/public-profile': 'Optional auth - shows user if authenticated',
        'GET /api/posts': 'Optional auth - shows filtered posts based on auth'
      },
      protected: {
        'GET /api/protected': 'Requires valid JWT token',
        'GET /api/admin-only': 'Requires JWT + admin role',
        'GET /api/moderator-access': 'Requires JWT + admin/moderator role',
        'POST /api/create-user': 'Requires JWT + admin role + valid body',
        'DELETE /api/data/:id': 'Requires JWT + admin role'
      },
      apiKey: {
        'POST /api/api-endpoint': 'Requires X-API-Key header'
      },
      rateLimited: {
        'GET /api/limited': 'Rate limited to 5 requests per minute'
      },
      demo: {
        'GET /demo/middleware-order': 'Shows middleware execution order',
        'GET /demo/error': 'Demonstrates error handling middleware',
        'POST /demo/pipeline': 'Shows request/response pipeline'
      }
    },
    testing: {
      step1: 'GET /api/tokens to retrieve test tokens',
      step2: 'Use token in Authorization: Bearer <token> header',
      step3: 'Access protected endpoints to test authentication',
      note: 'Check browser console/terminal for middleware execution logs'
    }
  });
});

app.get('/api/test-sequences', (req, res) => {
  res.json({
    message: 'Test different middleware sequences',
    tests: [
      {
        name: 'Public access test',
        endpoint: '/api/health',
        headers: 'None required'
      },
      {
        name: 'Token validation test',
        endpoint: '/api/protected',
        headers: 'Authorization: Bearer <valid-token>'
      },
      {
        name: 'Role-based access test',
        endpoint: '/api/admin-only',
        headers: 'Authorization: Bearer <admin-token>'
      },
      {
        name: 'Request body validation test',
        endpoint: 'POST /api/create-user',
        headers: 'Authorization: Bearer <admin-token>',
        body: '{"username": "john", "email": "john@example.com"}'
      },
      {
        name: 'API Key authentication test',
        endpoint: 'POST /api/api-endpoint',
        headers: 'X-API-Key: demo-api-key-12345',
        body: '{"action": "test"}'
      },
      {
        name: 'Rate limiting test',
        endpoint: '/api/limited',
        headers: 'None required',
        note: 'Call 6+ times in 60 seconds to trigger rate limit'
      }
    ]
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Express Middleware Demo Server`);
  console.log(`Running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Documentation: http://localhost:${PORT}/api/documentation`);
  console.log(`${'='.repeat(50)}\n`);

  console.log('MIDDLEWARE STACK:');
  console.log('  1. CORS Middleware');
  console.log('  2. Static Headers Security');
  console.log('  3. Request ID Generator');
  console.log('  4. JSON Body Parser');
  console.log('  5. Request Logger');
  console.log('  6. Performance Monitor');
  console.log('  7. Route Handlers');
  console.log('  8. Error Handler (last)\n');
});
