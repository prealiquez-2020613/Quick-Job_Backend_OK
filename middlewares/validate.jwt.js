'use strict';

import jwt from 'jsonwebtoken';

export const validateJwt = async (req, res, next) => {
  try {
    const secretKey = process.env.SECRET_KEY;
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Token missing or malformed.'
      });
    }

    const token = authorization.split(' ')[1];
    const user = jwt.verify(token, secretKey);
    req.user = user;

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admins only.'
    });
  }
  next();
};

export const isClient = (req, res, next) => {
  if (req.user.role !== 'CLIENT') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Clients only.'
    });
  }
  next();
};

export const isWorker = (req, res, next) => {
  if (req.user.role !== 'WORKER') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Workers only.'
    });
  }
  next();
};