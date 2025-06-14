import { Router } from 'express'
import { login, register, test} from './auth.controller.js';
import { validateJwt } from '../../middlewares/validate.jwt.js';
import {registerValidator, loginValidator} from '../../helpers/validators.js';


const api = Router();

//Rutas públicas
api.post('/login', [loginValidator], login);
api.post('/register', [registerValidator], register);

//Rutas privadas
api.get('/test', validateJwt, test);

export default api