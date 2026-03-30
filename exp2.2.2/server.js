require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const bankingRoutes = require('./routes/banking');
const app = express();
app.use(express.json());
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/banking', bankingRoutes);

app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
