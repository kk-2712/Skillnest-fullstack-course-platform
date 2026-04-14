const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');

const app = express();

/* =========================
   🔥 CORS FIX (IMPORTANT)
========================= */
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://skillnest-fullstack-course-platform.vercel.app',
    ],
    credentials: true,
  })
);

/* =========================
   Middleware
========================= */
app.use(express.json());

/* =========================
   Routes
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

/* =========================
   Health Check
========================= */
app.get('/', (req, res) => {
  res.json({ message: 'SkillNest API is running 🚀' });
});

/* =========================
   Mongo + Server Start
========================= */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✅');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error ❌:', err.message);
    process.exit(1);
  });