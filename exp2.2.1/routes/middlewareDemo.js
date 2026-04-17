const express = require('express');
const router = express.Router();
const { verifyJWT, optionalAuth, authorizeRole, verifyApiKey, rateLimit } = require('../middleware/auth');
const { validateBody } = require('../middleware/utils');
const { generateAdminToken, generateUserToken } = require('../utils/tokenGenerator');

router.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

router.get('/tokens', (req, res) => {
  const adminToken = generateAdminToken();
  const userToken = generateUserToken();

  res.json({
    message: 'Here are test tokens for middleware testing',
    admin: {
      token: adminToken,
      role: 'admin'
    },
    user: {
      token: userToken,
      role: 'user'
    },
    usage: 'Add "Authorization: Bearer <token>" to request headers'
  });
});

router.get('/public-profile', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({
      message: 'Authenticated user profile',
      user: req.user
    });
  } else {
    res.json({
      message: 'Public profile (no authentication)',
      user: 'anonymous'
    });
  }
});

router.get('/protected', verifyJWT, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user,
    note: 'Access granted because you have a valid token'
  });
});

router.get('/admin-only', verifyJWT, authorizeRole(['admin']), (req, res) => {
  res.json({
    message: 'Admin-only resource accessed',
    admin: req.user.username,
    note: 'Access granted because you have admin role'
  });
});

router.get('/moderator-access', 
  verifyJWT, 
  authorizeRole(['admin', 'moderator']), 
  (req, res) => {
    res.json({
      message: 'Moderator resource accessed',
      user: req.user.username,
      role: req.user.role,
      note: 'Access granted for admin or moderator role'
    });
  }
);

router.post('/api-endpoint', verifyApiKey, validateBody(['action']), (req, res) => {
  res.json({
    message: 'API endpoint accessed',
    action: req.body.action,
    note: 'Required valid X-API-Key header'
  });
});

router.post('/create-user',
  verifyJWT,
  authorizeRole(['admin']),
  validateBody(['username', 'email']),
  (req, res) => {
    res.json({
      message: 'User creation successful',
      user: {
        username: req.body.username,
        email: req.body.email,
        createdBy: req.user.username
      }
    });
  }
);

router.get('/limited', rateLimit(5, 60000), (req, res) => {
  res.json({
    message: 'Rate-limited endpoint',
    note: 'Max 5 requests per minute'
  });
});

router.delete('/data/:id',
  verifyJWT,
  authorizeRole(['admin']),
  (req, res) => {
    res.json({
      message: 'Data deleted',
      dataId: req.params.id,
      deletedBy: req.user.username,
      timestamp: new Date()
    });
  }
);

router.get('/posts', optionalAuth, (req, res) => {
  const allPosts = [
    { id: 1, title: 'Public post', visibility: 'public' },
    { id: 2, title: 'Private post', visibility: 'private' },
    { id: 3, title: 'Draft post', visibility: 'draft' }
  ];

  if (req.user) {
    res.json({
      message: 'All posts (authenticated view)',
      posts: allPosts,
      user: req.user.username
    });
  } else {
    const publicPosts = allPosts.filter(p => p.visibility === 'public');
    res.json({
      message: 'Public posts only (unauthenticated view)',
      posts: publicPosts
    });
  }
});

module.exports = router;
