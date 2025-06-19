import User from '../user/user.model.js';
import { checkPassword, encrypt } from '../../utils/encrypt.js';
import { generateJwt } from '../../utils/jwt.js';
import cloudinary from '../../configs/cloudinary.js'

//test
export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

// REGISTRO
export const register = async (req, res) => {
    try {
        const data = req.body;

        if (!['CLIENT', 'WORKER', 'ADMIN'].includes(data.role)) {
            return res.status(400).send({
                success: false,
                message: 'Invalid role. Must be CLIENT, WORKER or ADMIN.'
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email: data.email }, { username: data.username }]
        });

        if (existingUser) {
            return res.status(400).send({
                success: false,
                message: 'Username or email already exists'
            });
        }

        if (data.ratingAverage) return res.status(403).send({ message: 'You cannot set the ratingAverage field here' });
        if (data.status) return res.status(403).send({ message: 'You cannot set the userStatus field here' });

        data.password = await encrypt(data.password);
        data.userStatus = true;

        // Si hay imagen, subir a Cloudinary
        if (req.file) {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'profileImages' },
                async (error, result) => {
                    if (error) {
                        console.error('Error uploading image:', error);
                        return res.status(500).send({ success: false, message: 'Image upload failed' });
                    }

                    data.profileImage = result.secure_url;

                    const user = new User(data);
                    await user.save();

                    return res.send({
                        success: true,
                        message: `Registered successfully, can be logged with username: ${user.username}`,
                        imageUrl: result.secure_url
                    });
                }
            );

            uploadStream.end(req.file.buffer);
        } else {
            // Si no hay imagen, solo crear el usuario
            const user = new User(data);
            await user.save();

            return res.send({
                success: true,
                message: `Registered successfully, can be logged with username: ${user.username}`
            });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: 'General error with registering user',
            err
        });
    }
};

//Login
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Username/email and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { username: identifier.toLowerCase() },
        { email: identifier.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.userStatus) {
      return res.status(403).json({ success: false, message: 'Cuenta deshabilitada. Contacta al administrador.' });
    }

    const isPasswordValid = await checkPassword(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const loggedUser = {
      uid: user._id,
      name: user.name,
      username: user.username,
      role: user.role
    };

    const token = await generateJwt(loggedUser);

    return res.json({ success: true, message: `Welcome, ${user.name}`, loggedUser, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'General error with login function', error });
  }
};