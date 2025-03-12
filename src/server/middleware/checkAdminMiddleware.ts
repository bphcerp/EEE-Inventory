/**
 * @file authMiddleware.ts
 * @description This file contains the middleware function to authenticate and verify JWT tokens.
 */

import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/repositories.js';
import jwt from 'jsonwebtoken';

//
const checkAdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Cookie Parser is used as middleware before this to parse the cookies
    const token = req.cookies.token;

    if (!req.user?.permissions) {
        res.status(403).json({ message: 'Not authorized to access this route' });
        return
    }

    next()
};

export default checkAdminMiddleware;