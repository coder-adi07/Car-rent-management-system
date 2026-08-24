const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB সংযুক্ত: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB সংযোগ ব্যর্থ: ${error.message}`);
    // Do not exit — server continues running without DB during development
  }
};

module.exports = connectDB;
