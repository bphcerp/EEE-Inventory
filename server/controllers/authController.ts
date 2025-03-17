/**
 * @file authController.ts
 * @description This file contains the controllers for signing in and out
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { userRepository } from '../repositories/repositories';


const JWT_SECRET = process.env.JWT_SECRET!;

// Sign In Controller
export const signIn = async (req: Request, res: Response) => {
    const { token } = req.body;
    const client = new OAuth2Client(process.env.OAUTH_CID)

    try {

        const tokenInfo = await client.getTokenInfo(token);
        const email = tokenInfo.email;

        const user = await userRepository.findOneBy({ email });

        if (!user) {
            res.status(404).json({ message: 'User not found!' })
            return
        }

        // JWT and Cookie expire in 1 hour for admin, 3 hours for technician
        const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: user.permissions ? '1h' : '3h' });
        res.cookie('token', jwtToken, { httpOnly: true, sameSite: 'strict', expires: new Date(Date.now() + ( user.permissions ? 3600000 : 3600 * 1000 * 3)) });

        res.status(200).json({ message: 'Signed in successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error signing in', error });
        console.error(error);
    }
};

// Sign Out Controller
export const signOut = (req: Request, res: Response) => {
    res.clearCookie('token', { sameSite: 'strict' });
    res.status(200).json({ message: 'Signed out successfully' });
};