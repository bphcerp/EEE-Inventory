/**
 * @file authMiddleware.ts
 * @description This file contains the middleware function to authenticate and verify JWT tokens.
 */

import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/repositories.js';
import jwt from 'jsonwebtoken';
import { User } from '../entities/entities.js';

declare global {
    namespace Express {
      interface Request {
        user?: User
      }
    }
  }

// Auth Middleware to verify the token
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Cookie Parser is used as middleware before this to parse the cookies
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as { userId: string };
        const user = await userRepository.findOneBy({ id: decoded.userId });

        if (!user) {
            res.status(401).json({ message: 'Invalid token' });
            return
        }

        // Check if the user has permissions ( value = 1 for read and write) to perform non-GET operations
        if (req.method !== 'GET' && !user.permissions) {
            res.status(403).json({ message: 'User is not allowed to perform this operation' });
            return
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(440).json({ message: 'Token verification failed', error });
        console.error(error);
    }
};

export default authMiddleware;