const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bankingRoutes = require('./routes/bankingRoutes');

const app = express();
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/banking_db';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Successfully!'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('\nTIP: Ensure MongoDB is running and is configured as a REPLICA SET.');
  console.log('Transactions require a replica set or sharded cluster.');
});

app.use('/api', bankingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Banking system active' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`BANKING TRANSACTION SYSTEM (ACID DEMO)`);
  console.log(`Server running on port: ${PORT}`);
  console.log(`${'='.repeat(50)}\n`);
  console.log('Endpoints:');
  console.log('  1. POST /api/seed      - Setup dummy accounts');
  console.log('  2. POST /api/transfer  - Transfer money (ACID Session)');
  console.log('\nACID Compliance Properties Demonstrated:');
  console.log('  - Atomicity  : Transfer happens as a single unit or not at all');
  console.log('  - Consistency: Balances remain accurate even on network failure');
  console.log('  - Isolation  : Concurrent transfers do not interfere');
  console.log('  - Durability : Audit logs persist once transaction commits\n');
});
