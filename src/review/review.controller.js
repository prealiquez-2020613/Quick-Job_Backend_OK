import Review from './review.model.js';
import User from '../user/user.model.js';

// Función para actualizar el promedio de calificación de un trabajador o cliente
const updateAverageRating = async (userId) => {
  try {
    const reviews = await Review.find({
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
export const createReview = async (req, res) => {
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

    const existingReview = await Review.findOne({ client, worker });
    if (existingReview) {
      return res.status(400).send({ success: false, message: 'You already reviewed this worker' });
    }

    const review = new Review({ client, worker, rating, comment });
    await review.save();

    await updateAverageRating(worker);
    await updateAverageRating(client);

    return res.status(201).send({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error submitting review', error });
  }
};

// Crear una reseña de un trabajador para un cliente
export const createReviewForClient = async (req, res) => {
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

    if (workerUser.role !== 'WORKER') {
      return res.status(403).send({ success: false, message: 'Only WORKER users can submit reviews' });
    }

    if (clientUser.role !== 'CLIENT') {
      return res.status(403).send({ success: false, message: 'Only CLIENT users can receive reviews' });
    }

    const existingReview = await Review.findOne({ worker, client });
    if (existingReview) {
      return res.status(400).send({ success: false, message: 'You already reviewed this client' });
    }

    const review = new Review({ worker, client, rating, comment });
    await review.save();

    await updateAverageRating(worker);
    await updateAverageRating(client);

    return res.status(201).send({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error submitting review', error });
  }
};

// Actualizar una reseña existente
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const loggedUserId = req.user.uid;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).send({ success: false, message: 'Review not found' });
    }

    if (review.client.toString() !== loggedUserId && review.worker.toString() !== loggedUserId) {
      return res.status(403).send({ success: false, message: 'You can only update your own reviews' });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    await updateAverageRating(review.worker);
    await updateAverageRating(review.client);

    return res.send({ success: true, message: 'Review updated successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error updating review', error });
  }
};

// Eliminar reseña
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedUserId = req.user.uid;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).send({ success: false, message: 'Review not found' });
    }

    if (review.client.toString() !== loggedUserId && review.worker.toString() !== loggedUserId) {
      return res.status(403).send({ success: false, message: 'You can only delete your own reviews' });
    }

    const workerId = review.worker;
    const clientId = review.client;

    await review.deleteOne();

    await updateAverageRating(workerId);
    await updateAverageRating(clientId);

    return res.send({ success: true, message: 'Review deleted successfully', review });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error deleting review', error });
  }
};

// Obtener todas las reseñas de un trabajador
export const getReviewsByWorker = async (req, res) => {
  try {
    const { workerId } = req.params;

    const reviews = await Review.find({ worker: workerId })
      .populate('client', 'username name')
      .sort({ createdAt: -1 });

    return res.send({ success: true, message: 'Reviews retrieved', reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error retrieving reviews', error });
  }
};

// Obtener todas las reseñas de un cliente
export const getReviewsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const reviews = await Review.find({ client: clientId })
      .populate('worker', 'username name')
      .sort({ createdAt: -1 });

    return res.send({ success: true, message: 'Reviews retrieved', reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Error retrieving reviews', error });
  }
};
