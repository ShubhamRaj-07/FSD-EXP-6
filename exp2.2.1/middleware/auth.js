const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(`✓ Token verified for user: ${decoded.username}`);
    next();
  } catch (err) {
    console.log(`✗ Token verification failed: ${err.message}`);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }

  next();
};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    console.log(`✓ User ${req.user.username} authorized for role: ${req.user.role}`);
    next();
  };
};

const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query['api_key'];
  const validApiKey = 'demo-api-key-12345';

  if (!apiKey) {
    return res.status(401).json({ message: 'API key required' });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({ message: 'Invalid API key' });
  }

  console.log('✓ API key verified');
  next();
};

const rateLimitMap = {};

const rateLimit = (maxRequests = 10, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimitMap[ip]) {
      rateLimitMap[ip] = [];
    }

    rateLimitMap[ip] = rateLimitMap[ip].filter(time => now - time < windowMs);

    if (rateLimitMap[ip].length >= maxRequests) {
      return res.status(429).json({ message: 'Too many requests' });
    }

    rateLimitMap[ip].push(now);
    console.log(`Rate limit: ${rateLimitMap[ip].length}/${maxRequests} requests from ${ip}`);
    next();
  };
};

module.exports = {
  verifyJWT,
  optionalAuth,
  authorizeRole,
  verifyApiKey,
  rateLimit
};
