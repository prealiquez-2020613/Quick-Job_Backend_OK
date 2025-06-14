import WorkerReview from './workerReview.model.js';
import User from '../user/user.model.js';

// Función para actualizar el promedio de calificación de un trabajador
const updateAverageRating = async (userId) => {
  try {
    const reviews = await WorkerReview.find({ worker: userId });

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

// Crear una reseña de un trabajador para un cliente
export const createWorkerReview = async (req, res) => {
  try {
    const { client, rating, comment } = req.body;
    const worker = req.user.uid;

    if (!client || !rating) {
      return res.status(400).send({ success: false, message: 'Client and rating are required' });
    }

    const workerUser = await User.findById(worker);
    const clientUser = await User.findById(client);

    if (!workerUser || !clientUser) {
      return res.status(404).send({ success: false, message: 'Worker or client not found' });
    }

    // Verificar si el trabajador ya ha reseñado a este cliente
    const existingReview = await WorkerReview.findOne({ worker, client });
    if (existingReview) {
      return res.status(400).send({ success: false, message: 'You already reviewed this client' });
    }

    const review = new WorkerReview({ worker, client, rating, comment });
    await review.save();

    await updateAverageRating(client);

    return res.status(201).send({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error submitting review', error });
  }
};

// Actualizar una reseña de un trabajador a un cliente
export const updateWorkerReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const loggedUserId = req.user.uid;

    const review = await WorkerReview.findById(id);
    if (!review) {
      return res.status(404).send({ success: false, message: 'Review not found' });
    }

    if (review.worker.toString() !== loggedUserId) {
      return res.status(403).send({ success: false, message: 'You can only update your own reviews' });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    await updateAverageRating(review.client);

    return res.send({ success: true, message: 'Review updated successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error updating review', error });
  }
};

// Eliminar una reseña de un trabajador a un cliente
export const deleteWorkerReview = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedUserId = req.user.uid;

    const review = await WorkerReview.findById(id);
    if (!review) {
      return res.status(404).send({ success: false, message: 'Review not found' });
    }

    if (review.worker.toString() !== loggedUserId) {
      return res.status(403).send({ success: false, message: 'You can only delete your own reviews' });
    }

    const clientId = review.client;

    await review.deleteOne();

    await updateAverageRating(clientId);

    return res.send({ success: true, message: 'Review deleted successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error deleting review', error });
  }
};

import WorkerReview from './workerReview.model.js';

// Obtener todas las reseñas de un trabajador
export const getAllWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;

    // Obtener todas las reseñas donde este trabajador sea el receptor de la reseña
    const reviews = await WorkerReview.find({ worker: workerId })
      .populate('client', 'username name')
      .sort({ createdAt: -1 });  // Ordenar las reseñas más recientes primero

    if (reviews.length === 0) {
      return res.status(404).send({ success: false, message: 'No reviews found for this worker' });
    }

    return res.send({ success: true, message: 'Reviews retrieved successfully', reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error retrieving reviews', error });
  }
};
