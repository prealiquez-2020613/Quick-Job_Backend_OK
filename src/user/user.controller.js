import User from './user.model.js'
import { checkPassword, encrypt } from "../../utils/encrypt.js"
import cloudinary from '../../configs/cloudinary.js'

// ELIMINAR CUENTA
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.uid
        const { password } = req.body

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' })
        }

        if (user && await checkPassword(user.password, password)) {
            await User.findByIdAndUpdate(userId, { userStatus: false }, { new: true })
            return res.send({ success: true, message: 'User deleted successfully' })
        };

        return res.status(404).send({ success: false, message: 'Wrong password' })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ success: false, message: 'General error deleting account', error })
    }
};

// ELIMINAR USUARIO
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' })
        }

        await User.findByIdAndUpdate(userId, { userStatus: false }, { new: true })
        return res.send({ success: true, message: 'User deleted successfully' })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ success: false, message: 'General error deleting user', error })
    }
};

// ACTUALIZAR USUARIO
export const updateUser = async (req, res) => {
    try {
        const id = req.user.uid;
        const newdata = req.body;

        if (newdata.password) return res.status(403).send({ message: 'You cannot update the password here' });
        if (newdata.role) return res.status(403).send({ message: 'You cannot update the role here' });

        const user = await User.findById(id);
        if (!user) return res.status(404).send({ success: false, message: 'User not found' });

        // Si se sube nueva imagen de perfil
        if (req.file) {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'profileImages' },
                async (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        return res.status(500).send({ success: false, message: 'Error uploading image' });
                    }

                    newdata.profileImage = result.secure_url;

                    const updatedUser = await User.findByIdAndUpdate(id, newdata, { new: true });
                    return res.send({ success: true, message: 'User updated successfully', data: updatedUser });
                }
            );
            stream.end(req.file.buffer);
        } else {
            // Si no hay imagen nueva, solo actualiza los datos
            const updatedUser = await User.findByIdAndUpdate(id, newdata, { new: true });
            return res.send({ success: true, message: 'User updated successfully', data: updatedUser });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, message: 'General Error', error });
    }
};

// ACTUALIZAR ROL
export const updateRole = async (req, res) => {
    try {
        const { id } = req.params
        const { newRole } = req.body

        const validRoles = ['ADMIN', 'CLIENT', 'WORKER']

        if (!validRoles.includes(newRole.toUpperCase())) {
            return res.status(400).send({ success: false, message: 'Roles can only be ADMIN, CLIENT, or WORKER' })
        }

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' })
        }

        user.role = newRole.toUpperCase()
        await user.save()

        return res.send({ success: true, message: 'User role updated successfully', user })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ success: false, message: 'General Error', error })
    }
}

// ACTUALIZAR CONTRASEÑA
export const updatePassword = async (req, res) => {
    try {
        const id = req.user.uid
        const { actualPassword, newPassword } = req.body

        const user = await User.findById(id)
        if (!user) return res.status(404).send({ message: 'User not found' })

        if (user && await checkPassword(user.password, actualPassword)) {
            user.password = await encrypt(newPassword)
            await user.save()

            return res.send({ success: true, message: 'Password Updated Successfully', user })
        }

        return res.status(404).send({ success: false, message: 'Wrong password' })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ success: false, message: 'General Error', error })
    }
};

// OBTENER TODOS LOS USUARIOS
export const getAll = async (req, res) => {
    try {
        const { limit = 20, skip = 0 } = req.query
        const users = await User.find().skip(skip).limit(limit)

        if (users.length === 0) return res.status(404).send({ success: false, message: 'Users not found' })
        return res.send({ success: true, message: 'Users found', users, total: users.length })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ success: false, message: 'General error', error })
    }
}

// OBTENER UN USUARIO POR SU ID
export const get = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)

        if (!user) return res.status(404).send({ success: false, message: 'User not found' })
        return res.send({ success: true, message: 'User found', user })

    } catch (error) {
        return res.status(500).send({ success: false, message: 'General Error', error })
    }
}

// LISTAR SOLO WORKERS
export const getWorkers = async (req, res) => {
    try {
        const { limit = 20, skip = 0 } = req.query;
        const workers = await User.find({ role: 'WORKER', userStatus: true })
                                  .skip(skip)
                                  .limit(limit);

        if (workers.length === 0) return res.status(404).send({ success: false, message: 'No workers found' });

        return res.send({ success: true, message: 'Workers found', users: workers, total: workers.length });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, message: 'Error fetching workers', error });
    }
};

// LISTAR SOLO CLIENTES
export const getClients = async (req, res) => {
    try {
        const { limit = 20, skip = 0 } = req.query;
        const clients = await User.find({ role: 'CLIENT', userStatus: true })
                                  .skip(skip)
                                  .limit(limit);

        if (clients.length === 0) return res.status(404).send({ success: false, message: 'No clients found' });

        return res.send({ success: true, message: 'Clients found', users: clients, total: clients.length });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, message: 'Error fetching clients', error });
    }
}