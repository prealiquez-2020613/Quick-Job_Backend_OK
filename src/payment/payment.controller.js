import Payment from './payment.model.js';

// Crear un nuevo pago (general, útil para pruebas o futuro uso)
export const createPayment = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { amount, method, type } = req.body;

    if (!amount || !method || !type) {
      return res.status(400).json({ success: false, message: 'Amount, method and type are required' });
    }

    const payment = new Payment({
      user: userId,
      amount,
      method,
      type,
      status: 'COMPLETED'
    });

    await payment.save();

    return res.status(201).json({
      success: true,
      message: 'Payment recorded',
      payment
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error creating payment', error: error.message });
  }
};

// Obtener todos los pagos del usuario
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.uid;

    const payments = await Payment.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error fetching payments', error: error.message });
  }
};