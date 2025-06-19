import JobRequest from './jobRequest.model.js';
import User from '../user/user.model.js';

// Crear una solicitud de trabajo (cliente → trabajador)
export const createJobRequest = async (req, res) => {
  try {
    const { worker, description, agreedPrice } = req.body;
    const client = req.user.uid;

    const clientUser = await User.findById(client);
    const workerUser = await User.findById(worker);

    if (!clientUser) {
      return res.status(403).json({ success: false, message: 'CLIENT not found' });
    }

    if (!workerUser || workerUser.role !== 'WORKER') {
      return res.status(403).json({ success: false, message: 'Target user is not a WORKER' });
    }

    const newRequest = new JobRequest({
      client,
      worker,
      description,
      agreedPrice
    });

    await newRequest.save();

    return res.status(201).json({ success: true, message: 'Job request sent', request: newRequest });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error creating job request', error: error.message });
  }
};

// Obtener solicitudes enviadas por el cliente
export const getClientJobRequests = async (req, res) => {
  try {
    const client = req.user.uid;
    const requests = await JobRequest.find({ client })
      .populate('worker', 'username name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error fetching job requests', error: error.message });
  }
};

// Obtener solicitudes recibidas por el trabajador
export const getWorkerJobRequests = async (req, res) => {
  try {
    const worker = req.user.uid;
    const requests = await JobRequest.find({ worker })
      .populate('client', 'username name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error fetching job requests', error: error.message });
  }
};

// Cambiar el estado de una solicitud (por el trabajador)
export const updateJobRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const worker = req.user.uid;

    const validStatuses = ['CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const request = await JobRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Job request not found' });
    }

    request.status = status;
    await request.save();

    return res.status(200).json({ success: true, message: 'Job request updated', request });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error updating request', error: error.message });
  }
};

// Eliminar una solicitud (solo cliente)
export const deleteJobRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const client = req.user.uid;

    const request = await JobRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Job request not found' });
    }

    if (request.client.toString() !== client) {
      return res.status(403).json({ success: false, message: 'You can only delete your own job requests' });
    }

    await request.deleteOne();

    return res.status(200).json({ success: true, message: 'Job request deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error deleting job request', error: error.message });
  }
};