const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware to verify JWT token and attach user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে। অথরাইজেশন টোকেন পাওয়া যায়নি।',
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'সার্ভার কনফিগারেশন ত্রুটি: JWT_SECRET পাওয়া যায়নি।',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'টোকেনের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে নতুন করে লগইন করুন।',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'অকার্যকর অথবা অবৈধ অথরাইজেশন টোকেন।',
      });
    }

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'অবৈধ টোকেন পেলোড।',
      });
    }

    // User.findById excludes password by default due to select: false in User schema
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ইউজার অ্যাকাউন্টটি আর বিদ্যমান নেই।',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'ইউজার অ্যাকাউন্টটি নিষ্ক্রিয় রয়েছে।',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'অথেন্টিকেশন প্রক্রিয়া ব্যর্থ হয়েছে।',
    });
  }
};

module.exports = protect;
module.exports.protect = protect;
