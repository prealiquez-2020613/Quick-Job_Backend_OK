import ClientReview from './clientReview.model.js';
import User from '../user/user.model.js';

// Función para actualizar el promedio de calificación de un cliente
const updateAverageRating = async (userId) => {
  try {
    const reviews = await ClientReview.find({
      $or: [{ worker: userId }, { client: userId }]
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

// Crear una reseña de un cliente para un trabajador
export const createClientReview = async (req, res) => {
  try {
    const { worker, rating, comment } = req.body;
    const client = req.user.uid;

    if (!worker || !rating) {
      return res.status(400).send({ success: false, message: 'Worker and rating are required' });
    }

    const clientUser = await User.findById(client);
    const workerUser = await User.findById(worker);

    if (!clientUser || !workerUser) {
      return res.status(404).send({ success: false, message: 'Client or worker not found' });
    }

    if (clientUser.role !== 'CLIENT') {
      return res.status(403).send({ success: false, message: 'Only CLIENT users can submit reviews' });
    }

    if (workerUser.role !== 'WORKER') {
      return res.status(403).send({ success: false, message: 'Only WORKER users can receive reviews' });
    }

    const existingReview = await ClientReview.findOne({ client, worker });
    if (existingReview) {
      return res.status(400).send({ success: false, message: 'You already reviewed this worker' });
    }

    const review = new ClientReview({ client, worker, rating, comment });
    await review.save();

    await updateAverageRating(worker);

    return res.status(201).send({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error submitting review', error });
  }
};

// Actualizar una reseña de un cliente para un trabajador
export const updateClientReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const loggedUserId = req.user.uid;

    const review = await ClientReview.findById(id);
    if (!review) {
      return res.status(404).send({ success: false, message: 'Review not found' });
    }

    if (review.client.toString() !== loggedUserId) {
      return res.status(403).send({ success: false, message: 'You can only update your own reviews' });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    await updateAverageRating(review.worker);

    return res.send({ success: true, message: 'Review updated successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error updating review', error });
  }
};

// Eliminar una reseña de un cliente para un trabajador
export const deleteClientReview = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedUserId = req.user.uid;

    const review = await ClientReview.findById(id);
    if (!review) {
      return res.status(404).send({ success: false, message: 'Review not found' });
    }

    if (review.client.toString() !== loggedUserId) {
      return res.status(403).send({ success: false, message: 'You can only delete your own reviews' });
    }

    const workerId = review.worker;

    await review.deleteOne();

    await updateAverageRating(workerId);

    return res.send({ success: true, message: 'Review deleted successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error deleting review', error });
  }
};

// Obtener todas las reseñas de un cliente
export const getAllClientReviews = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Obtener todas las reseñas donde este cliente sea el receptor de la reseña
    const reviews = await ClientReview.find({ client: clientId })
      .populate('worker', 'username name')
      .sort({ createdAt: -1 });  // Ordenar las reseñas más recientes primero

    if (reviews.length === 0) {
      return res.status(404).send({ success: false, message: 'No reviews found for this client' });
    }

    return res.send({ success: true, message: 'Reviews retrieved successfully', reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error retrieving reviews', error });
  }
};