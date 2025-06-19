import Review from './review.model.js';
import User from '../user/user.model.js';
import JobRequest from '../jobRequest/jobRequest.model.js';

// Función para actualizar el promedio de calificación de un usuario
const updateAverageRating = async (userId) => {
  try {
    const reviews = await Review.find({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    if (reviews.length === 0) {
      await User.findByIdAndUpdate(userId, { ratingAverage: 0 });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(userId, { ratingAverage: parseFloat(averageRating.toFixed(2)) });
  } catch (error) {
    console.error('Error updating average rating:', error);
  }
};

// Crear una reseña
export const createReview = async (req, res) => {
  try {
    const { receiver, rating, comment } = req.body;
    const sender = req.user.uid;

    if (!receiver || !rating) {
      return res.status(400).json({ success: false, message: 'Receiver and rating are required' });
    }

    const senderUser = await User.findById(sender);
    const receiverUser = await User.findById(receiver);

    if (!senderUser || !receiverUser) {
      return res.status(404).json({ success: false, message: 'Sender or receiver not found' });
    }

    const existingReview = await Review.findOne({ sender, receiver });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You already reviewed this user' });
    }

    const jobRequest = await JobRequest.findOne({
      $or: [
        { client: sender, worker: receiver },
        { client: receiver, worker: sender }
      ],
      status: { $ne: 'PENDING' }
    });

    if (!jobRequest) {
      return res.status(400).json({
        success: false,
        message: 'You cannot review someone you have not worked with'
      });
    }

    const review = new Review({ sender, receiver, rating, comment });
    await review.save();

    await updateAverageRating(receiver);

    return res.status(201).json({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error submitting review', error: error.message });
  }
};

// Obtener todas las reseñas enviadas por un usuario
export const getSentReviews = async (req, res) => {
  try {
    const sender = req.user.uid;

    const reviews = await Review.find({ sender })
      .populate('receiver', 'username name profileImage')
      .sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'No reviews found for this user' });
    }

    return res.status(200).json({ success: true, message: 'Sent reviews retrieved successfully', reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error retrieving sent reviews', error: error.message });
  }
};

// Obtener todas las reseñas recibidas por un usuario
export const getReceivedReviews = async (req, res) => {
  try {
    const receiver = req.user.uid;

    const reviews = await Review.find({ receiver })
      .populate('sender', 'username name profileImage')
      .sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'No reviews found for this user' });
    }

    return res.status(200).json({ success: true, message: 'Received reviews retrieved successfully', reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error retrieving received reviews', error: error.message });
  }
};

// Actualizar una reseña
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const loggedUserId = req.user.uid;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.sender.toString() !== loggedUserId) {
      return res.status(403).json({ success: false, message: 'You can only update your own reviews' });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();
    await updateAverageRating(review.receiver);

    return res.status(200).json({ success: true, message: 'Review updated successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error updating review', error: error.message });
  }
};

// Eliminar una reseña
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedUserId = req.user.uid;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.sender.toString() !== loggedUserId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own reviews' });
    }

    const receiverId = review.receiver;
    await review.deleteOne();
    await updateAverageRating(receiverId);

    return res.status(200).json({ success: true, message: 'Review deleted successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error deleting review', error: error.message });
  }
};

// Obtener todas las reseñas recibidas por un usuario (cuando el usuario es el receptor)
export const getUserReceivedReviews = async (req, res) => {
  try {
    const { workerId } = req.params;

    const reviews = await Review.find({ receiver: workerId })
      .populate('sender', 'username name profileImage')
      .sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'No reviews found for this user' });
    }

    return res.status(200).json({ success: true, message: 'Received reviews retrieved successfully', reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error retrieving received reviews', error: error.message });
  }
};