'use strict'

import jwt from 'jsonwebtoken'

export const validateJwt = async (req, res, next) => {
    try {
        let secretKey = process.env.SECRET_KEY
        let { authorization } = req.headers

        if (!authorization) {
            return res.status(401).send({ message: 'Unauthorized, token missing' })
        }

        let user = jwt.verify(authorization, secretKey)

        req.user = user
        
        next()

    } catch (err) {
        console.error(err)
        return res.status(401).send({ message: 'Invalid token or expired' })
    }
}


export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send({ message: 'Forbidden, only admins allowed' })
    }
    next()
}

export const isClient = (req, res, next) => {
    if (req.user.role !== 'CLIENT') {
        return res.status(403).send({ message: 'Forbidden, only clients allowed' })
    }
    next()
}

export const isWorker = (req, res, next) => {
    if (req.user.role !== 'WORKER') {
        return res.status(403).send({ message: 'Forbidden, only worker allowed' })
    }
    next()
}