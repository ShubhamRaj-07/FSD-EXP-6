const express = require('express');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();
router.use(verifyToken);
router.get('/balance', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    res.json({
      accountNumber: user.accountNumber,
      balance: user.balance,
      name: user.name
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
router.post('/deposit', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { balance: amount } },
      { new: true }
    );
    res.json({
      message: `Deposited Rs.${amount}`,
      newBalance: user.balance
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
router.post('/withdraw', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    user.balance -= amount;
    await user.save({ validateBeforeSave: false });
    res.json({
      message: `Withdrew Rs.${amount}`,
      newBalance: user.balance
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
