import Review from './review.model.js';
import User from '../user/user.model.js';

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

    await User.findByIdAndUpdate(userId, { ratingAverage: averageRating });
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
      return res.status(400).send({ success: false, message: 'Receiver and rating are required' });
    }

    const senderUser = await User.findById(sender);
    const receiverUser = await User.findById(receiver);

    if (!senderUser || !receiverUser) {
      return res.status(404).send({ success: false, message: 'Sender or receiver not found' });
    }

    // Verificar que el sender no haya hecho una review a este receiver en el mismo orden
    const existingReview = await Review.findOne({ sender, receiver });
    if (existingReview) {
      return res.status(400).send({ success: false, message: 'You already reviewed this user' });
    }

    const review = new Review({ sender, receiver, rating, comment });
    await review.save();

    // Actualizar promedio de calificación del receptor
    await updateAverageRating(receiver);

    return res.status(201).send({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error submitting review', error });
  }
};

// Obtener todas las reseñas enviadas por un usuario
export const getSentReviews = async (req, res) => {
  try {
    const sender = req.user.uid;

    const reviews = await Review.find({ sender })
      .populate('receiver', 'username name')
      .sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return res.status(404).send({ success: false, message: 'No reviews found for this user' });
    }

    return res.send({ success: true, message: 'Sent reviews retrieved successfully', reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error retrieving sent reviews', error });
  }
};

// Obtener todas las reseñas recibidas por un usuario
export const getReceivedReviews = async (req, res) => {
  try {
    const receiver = req.user.uid;

    const reviews = await Review.find({ receiver })
      .populate('sender', 'username name')
      .sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return res.status(404).send({ success: false, message: 'No reviews found for this user' });
    }

    return res.send({ success: true, message: 'Received reviews retrieved successfully', reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error retrieving received reviews', error });
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
      return res.status(404).send({ success: false, message: 'Review not found' });
    }

    if (review.sender.toString() !== loggedUserId) {
      return res.status(403).send({ success: false, message: 'You can only update your own reviews' });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    // Actualizar el promedio del receptor
    await updateAverageRating(review.receiver);

    return res.send({ success: true, message: 'Review updated successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error updating review', error });
  }
};

// Eliminar una reseña
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedUserId = req.user.uid;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).send({ success: false, message: 'Review not found' });
    }

    if (review.sender.toString() !== loggedUserId) {
      return res.status(403).send({ success: false, message: 'You can only delete your own reviews' });
    }

    const receiverId = review.receiver;

    await review.deleteOne();

    // Actualizar el promedio de calificación del receptor
    await updateAverageRating(receiverId);

    return res.send({ success: true, message: 'Review deleted successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error deleting review', error });
  }
};
