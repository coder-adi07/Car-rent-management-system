const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for an authenticated user.
 * @param {Object|string} userOrId - User document/object or user ObjectId/string ID.
 * @param {string} [roleParam] - Optional user role if userOrId is just an ID.
 * @returns {string} Signed JWT token string.
 */
const generateToken = (userOrId, roleParam) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is missing');
  }

  const jwtExpire = process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || '7d';

  let userId;
  let userRole;

  if (typeof userOrId === 'object' && userOrId !== null) {
    userId = userOrId._id ? userOrId._id.toString() : userOrId.id;
    userRole = userOrId.role || roleParam;
  } else {
    userId = userOrId ? userOrId.toString() : null;
    userRole = roleParam;
  }

  if (!userId) {
    throw new Error('User ID is required to generate a token');
  }

  const payload = {
    id: userId,
    ...(userRole && { role: userRole }),
  };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpire,
  });
};

module.exports = generateToken;
