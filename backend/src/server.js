require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start Express server immediately
const server = app.listen(PORT, () => {
  console.log(`সার্ভার চলছে: http://localhost:${PORT}`);
  console.log(`পরিবেশ: ${process.env.NODE_ENV}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ পোর্ট ${PORT} ইতোমধ্যে ব্যস্ত আছে!`);
    console.error(`পূর্ববর্তী নোড প্রসেস বন্ধ করতে কমান্ড প্রম্পটে চালান: npx kill-port ${PORT}`);
  } else {
    console.error('সার্ভার রানটাইম ত্রুটি:', err);
  }
});

// Connect to MongoDB — non-blocking, server stays alive if DB is unavailable
connectDB();
