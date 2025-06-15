import mongoose from 'mongoose';

const workerReviewSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxLength: 300
  }
}, { timestamps: true });

export default mongoose.model('WorkerReview', workerReviewSchema);