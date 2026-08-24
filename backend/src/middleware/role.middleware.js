/**
 * Role authorization middleware factory to restrict route access by user role.
 * @param {...string} allowedRoles - Allowed application roles ('admin', 'driver', 'customer').
 * @returns {Function} Express middleware function.
 */
const requireRole = (...allowedRoles) => {
  // Normalize roles if passed as an array or rest parameters
  const roles = Array.isArray(allowedRoles[0])
    ? allowedRoles[0]
    : allowedRoles;

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে। ইউজার অথেন্টিকেশন পাওয়া যায়নি।',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'আপনার এই রিসোর্সে অ্যাক্সেস করার অনুমতি নেই।',
      });
    }

    next();
  };
};

module.exports = requireRole;
module.exports.requireRole = requireRole;
