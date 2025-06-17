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
import { initializeDatabase } from './initSetup.js'

import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import { createServer } from 'node:http'

import { limiter } from '../middlewares/rate.limit.js'
import { getOrCreateChat } from '../services/chat.service.js'
import Chat from '../src/chat/chat.model.js'

const configs = (app) => {
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cors())
  app.use(helmet())
  app.use(limiter)
  app.use(morgan('dev'))
}

const routes = (app) => {
  app.use(authRoutes)
  app.use('/v1/user', userRoutes)
  app.use('/v1/category', categoryRoutes)
  app.use('/v1/clientReview', clientReviewRoutes)
  app.use('/v1/payment', paymentRoutes)
  app.use('/v1/recharge', rechargeRoutes)
  app.use('/v1/chat', chatRoutes)
  app.use('/v1/jobRequest', jobRequestRoutes)
  app.use('/v1/workerReview', workerReviewRoutes)
}

export const initServer = async () => {
  const app = express()
  const server = createServer(app)
  const io = new Server(server, {
    connectionStateRecovery: {},
    cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
  })

  io.use((socket, next) => {
    try {
      const { token } = socket.handshake.auth
      if (!token) throw new Error('TOKEN_MISSING')
      socket.user = jwt.verify(token, process.env.SECRET_KEY)
      next()
    } catch (err) {
      next(new Error('NOT_AUTHENTICATED'))
    }
  })

  io.on('connection', (socket) => {
    socket.on('chat startup', async ({ participantId }, ack) => {
      try {
        if (!participantId) throw new Error('PARTICIPANT_MISSING')
        if (participantId === socket.user.uid) throw new Error('SAME_USER')

        const { chat, isNew } = await getOrCreateChat(socket.user.uid, participantId)
        socket.join(chat._id.toString())

        ack?.(null, { chatId: chat._id, isNew })
        io.to(chat._id.toString()).emit('chat ready', {
          chatId: chat._id,
          startedBy: socket.user.uid,
          isNew
        })
      } catch (err) {
        ack?.(err.message)
      }
    })

    socket.on('join chat', ({ chatId }) => {
      if (chatId) socket.join(chatId)
    })

    socket.on('chat message', async ({ chatId, text }, ack) => {
      try {
        if (!chatId || !text?.trim()) throw new Error('BAD_PAYLOAD')

        const subDoc = {
          sender: socket.user.uid,
          text,
          timestamp: new Date()
        }

        const chat = await Chat.findByIdAndUpdate(
          chatId,
          { $push: { messages: subDoc } },
          { new: true }
        ).populate('messages.sender', 'name username')

        const message = chat.messages.at(-1).toObject()

        socket.broadcast.to(chatId).emit('chat message', { ...message, chatId })
        ack?.(null, { ...message, chatId })
      } catch (err) {
        ack?.(err.message)
      }
    })
  })

  try {
    configs(app)
    routes(app)
    await initializeDatabase()
    server.listen(process.env.PORT)
  } catch (err) {}
}
