const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Account = require('../models/account');
const AuditLog = require('../models/auditLog');

router.post('/transfer', async (req, res) => {
  const { fromAccountNumber, toAccountNumber, amount } = req.body;
  const transactionId = `TXN-${Date.now()}`;
  
  if (!fromAccountNumber || !toAccountNumber || amount <= 0) {
    return res.status(400).json({ message: 'Invalid transaction details' });
  }

  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    console.log(`\n--- STARTING TRANSACTION: ${transactionId} ---`);
    console.log(`From: ${fromAccountNumber} | To: ${toAccountNumber} | Amount: $${amount}`);

    const fromAccount = await Account.findOne({ accountNumber: fromAccountNumber }).session(session);
    if (!fromAccount) {
      throw new Error(`Account not found: ${fromAccountNumber}`);
    }

    if (fromAccount.balance < amount) {
      throw new Error(`Insufficient funds: ${fromAccountNumber} has $${fromAccount.balance}`);
    }

    const toAccount = await Account.findOne({ accountNumber: toAccountNumber }).session(session);
    if (!toAccount) {
      throw new Error(`Recipient account not found: ${toAccountNumber}`);
    }

    fromAccount.balance -= amount;
    await fromAccount.save({ session });
    console.log(`- Balance deducted from ${fromAccountNumber}. New balance: $${fromAccount.balance}`);

    toAccount.balance += amount;
    await toAccount.save({ session });
    console.log(`+ Balance added to ${toAccountNumber}. New balance: $${toAccount.balance}`);

    await AuditLog.create([{
      transactionId,
      fromAccount: fromAccountNumber,
      toAccount: toAccountNumber,
      amount,
      status: 'completed',
      sessionInfo: session.id.id.toString('hex')
    }], { session });

    console.log(`✓ Audit log created for transaction: ${transactionId}`);

    await session.commitTransaction();
    console.log(`✔ TRANSACTION COMMITTED SUCCESSFULLY: ${transactionId}\n`);

    res.json({
      success: true,
      message: 'Money transferred successfully',
      transactionId,
      newBalances: {
        from: fromAccount.balance,
        to: toAccount.balance
      }
    });

  } catch (error) {
    console.error(`\n✖ TRANSACTION FAILED: ${transactionId}`);
    console.error(`Reason: ${error.message}`);
    
    await session.abortTransaction();
    console.log(`↪ ROLLBACK PERFORMED: All changes reverted for ${transactionId}`);

    try {
      await AuditLog.create({
        transactionId,
        fromAccount: fromAccountNumber,
        toAccount: toAccountNumber,
        amount,
        status: 'failed',
        error: error.message
      });
      console.log(`⚠ Failure logged in audit persistent collection\n`);
    } catch (logErr) {
      console.error('Failed to log transaction error persistent:', logErr.message);
    }

    res.status(500).json({
      success: false,
      message: 'Transaction failed and rolled back',
      error: error.message,
      transactionId
    });

  } finally {
    session.endSession();
  }
});

router.post('/seed', async (req, res) => {
  try {
    await Account.deleteMany({});
    await AuditLog.deleteMany({});

    await Account.create([
      { accountNumber: '1001', owner: 'Alice', balance: 1000 },
      { accountNumber: '1002', owner: 'Bob', balance: 500 },
      { accountNumber: '1003', owner: 'Charlie', balance: 0 }
    ]);

    res.json({ message: 'Dummy accounts seeded successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
