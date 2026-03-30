const validateBody = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    requiredFields.forEach(field => {
      if (req.body[field] === undefined || req.body[field] === '') {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        missingFields
      });
    }

    console.log(`✓ Request body validation passed for fields: ${requiredFields.join(', ')}`);
    next();
  };
};

const errorHandler = (err, req, res, next) => {
  console.error('❌ ERROR:', err.message);
  console.error('Stack:', err.stack);

  const statusCode = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString()
    }
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.url}`,
      status: 404
    }
  });
};

const withTiming = (middlewareName) => {
  return (req, res, next) => {
    const startTime = Date.now();

    const originalNext = next;
    next = () => {
      const duration = Date.now() - startTime;
      console.log(`⏱️  ${middlewareName} executed in ${duration}ms`);
      originalNext();
    };

    next();
  };
};

const throwError = (req, res, next) => {
  const err = new Error('Intentional error from middleware');
  err.status = 500;
  next(err);
};

const requestId = (req, res, next) => {
  req.id = Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', req.id);
  console.log(`Request ID: ${req.id}`);
  next();
};

const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};

const staticHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

module.exports = {
  validateBody,
  errorHandler,
  notFoundHandler,
  withTiming,
  throwError,
  requestId,
  corsMiddleware,
  staticHeaders
};
