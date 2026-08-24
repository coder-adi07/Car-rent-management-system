const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI environment variable is missing!');
    return null;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(process.env.MONGO_URI).then((conn) => {
      console.log(`MongoDB সংযুক্ত: ${conn.connection.host}`);
      return conn;
    }).catch((error) => {
      cachedPromise = null;
      console.error(`MongoDB সংযোগ ব্যর্থ: ${error.message}`);
      throw error;
    });
  }

  try {
    return await cachedPromise;
  } catch (err) {
    return null;
  }
};

module.exports = connectDB;

