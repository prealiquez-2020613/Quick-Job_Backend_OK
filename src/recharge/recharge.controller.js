import Recharge from './recharge.model.js';
import Payment from '../payment/payment.model.js';

// Crear o sumar una recarga al balance
export const addRecharge = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { amount, method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid recharge amount' });
    }

    const payment = new Payment({
      user: userId,
      amount,
      method,
      type: 'RECHARGE',
      status: 'COMPLETED'
    });
    await payment.save();

    let recharge = await Recharge.findOne({ user: userId });
    if (!recharge) {
      recharge = new Recharge({ user: userId });
    }

    recharge.balance = Number(recharge.balance) + Number(amount);
    recharge.history.push({
      amount,
      reference: payment._id
    });

    await recharge.save();

    return res.status(201).json({
      success: true,
      message: 'Recharge added successfully',
      balance: recharge.balance,
      recharge
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error adding recharge', error: error.message });
  }
};

// Obtener información del saldo y el historial
export const getRechargeInfo = async (req, res) => {
  try {
    const userId = req.user.uid;

    const recharge = await Recharge.findOne({ user: userId })
      .populate('history.reference', 'amount method createdAt');

    if (!recharge) {
      return res.status(200).json({ success: true, balance: 0, history: [] });
    }

    return res.status(200).json({ success: true, balance: recharge.balance, history: recharge.history });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error fetching recharge info', error: error.message });
  }
};

// Descontar comisión por trabajo (10%)
export const discountCommission = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { jobAmount } = req.body;

    if (!jobAmount || jobAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid job amount' });
    }

    const commission = jobAmount * 0.10;

    const recharge = await Recharge.findOne({ user: userId });
    if (!recharge || recharge.balance < commission) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance to cover commission.'
      });
    }

    recharge.balance -= commission;
    recharge.history.push({
      amount: -commission,
      reference: null
    });
    await recharge.save();

    const payment = new Payment({
      user: userId,
      amount: commission,
      method: 'CARD',
      type: 'COMMISSION',
      status: 'COMPLETED'
    });
    await payment.save();

    return res.status(200).json({
      success: true,
      message: 'Commission successfully deducted.',
      newBalance: recharge.balance,
      commission,
      paymentId: payment._id
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error deducting commission', error: error.message });
  }
};