'use strict'

import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import authRoutes from '../src/auth/auth.routes.js'
import userRoutes from '../src/user/user.routes.js'
import categoryRoutes from '../src/category/category.routes.js'
import paymentRoutes from '../src/payment/payment.routes.js'
import rechargeRoutes from '../src/recharge/recharge.routes.js'
import chatRoutes from '../src/chat/chat.routes.js'
import jobRequestRoutes from '../src/jobRequest/jobRequest.routes.js'
import clientReviewRoutes from '../src/clientReview/clientReview.routes.js'
import workerReviewRoutes from '../src/workerReview/workerReview.routes.js'
import {initializeDatabase} from './initSetup.js'

import { limiter } from '../middlewares/rate.limit.js'

const configs = (app)=>{
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cors());
    app.use(helmet());
    app.use(limiter);
    app.use(morgan('dev'));
};

const routes = (app)=>{
    app.use(authRoutes);
    app.use('/v1/user', userRoutes);
    app.use('/v1/category', categoryRoutes);
    app.use('/v1/clientReview', clientReviewRoutes);
    app.use('/v1/payment', paymentRoutes);
    app.use('/v1/recharge', rechargeRoutes);
    app.use('/v1/chat', chatRoutes);
    app.use('/v1/jobRequest', jobRequestRoutes);
    app.use('/v1/workerReview', workerReviewRoutes);
};



export const initServer = async()=>{
    const app = express() 
    try{
        configs(app) 
        routes(app)
        await initializeDatabase();
        app.listen(process.env.PORT)
        console.log(`Server running in port ${process.env.PORT}`)
    }catch(err){
        console.error('Server init failed', err)
    }
}
