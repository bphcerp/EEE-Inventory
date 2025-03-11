import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/repositories.js';
const jwt = require('jsonwebtoken');

// Auth Middleware to verify the token
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Cookie Parser is used as middleware before this to parse the cookies
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
        const user = await userRepository.findOneBy({ id: decoded.userId });

        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Token verification failed', error: (error as Error).message });
        console.error(error);
    }
};

export default authMiddleware;