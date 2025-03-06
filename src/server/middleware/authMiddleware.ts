import { OAuth2Client } from 'google-auth-library';
import { Request, Response, NextFunction } from 'express';

const client = new OAuth2Client('YOUR_CLIENT_ID');

//Auth Middleware to verify the token using Google OAuth2Client
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    //Cookie Parser is used a middleware before this to parse the cookies
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        await client.verifyIdToken({
            idToken: token,
            audience: process.env.OAUTH_CID,
        });
    } catch (error) {
        res.status(401).json({ message: 'Token verification failed', error: (error as Error).message });
    }
};

export default authMiddleware;