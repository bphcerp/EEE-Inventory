/**
 * @file checkAdminMiddlewareforGet.ts
 * @description This file contains the middleware function to authorize Admin only GET requests.
 */

import { Request, Response, NextFunction } from 'express';

// Middleware to check if user is admin
// This check is already done for non-GET requests in authMiddleware
// This is for those GET requests which need Admin perms.
const checkAdminMiddlewareforGET = async (req: Request, res: Response, next: NextFunction) => {
    // Cookie Parser is used as middleware before this to parse the cookies
    const token = req.cookies.token;

    if (!req.user?.permissions) {
        res.status(403).json({ message: 'Not authorized to access this route' });
        return
    }

    next()
};

export default checkAdminMiddlewareforGET;