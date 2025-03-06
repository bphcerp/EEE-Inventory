import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { userRepository } from '../repositories/userRepository.js';
import { OAuth2Client } from 'google-auth-library'

config();

const JWT_SECRET = process.env.JWT_SECRET!;
const client = new OAuth2Client(process.env.OAUTH_CID)

// Sign In Controller
export const signIn = async (req: Request, res: Response) => {
    const { credential } = req.body;

    try {
        const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: process.env.OAUTH_CID
		})
        const decoded = ticket.getPayload()!;
        const user = await userRepository.findOneBy({ email: decoded.email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });

        res.status(200).json({ message: 'Signed in successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error signing in', error: (error as Error).message });
    }
};

// Sign Out Controller
export const signOut = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Signed out successfully' });
};