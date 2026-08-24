// Centralized global error handling middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'সার্ভারে একটি সমস্যা হয়েছে।';

  // Handle Mongoose CastError (invalid ObjectId / bad format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'অবৈধ অবজেক্ট আইডি বা ডাটা ফরম্যাট প্রদান করা হয়েছে।';
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'এই তথ্যটি ইতোমধ্যে সিস্টেমে ব্যবহৃত হয়েছে।';
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'অবৈধ বা অকার্যকর অথরাইজেশন টোকেন।';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'টোকেনের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে পুনরায় লগইন করুন।';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
