const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateAdminToken = () => {
  return generateToken({
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin'
  });
};

const generateUserToken = () => {
  return generateToken({
    username: 'user',
    email: 'user@example.com',
    role: 'user'
  });
};

const generateExpiredToken = () => {
  return jwt.sign(
    { username: 'expired', role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '-1h' }
  );
};

module.exports = {
  generateToken,
  generateAdminToken,
  generateUserToken,
  generateExpiredToken
};
