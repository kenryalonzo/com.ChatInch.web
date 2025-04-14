import { Types } from 'mongoose';
import { Response } from 'express';
import jwt from 'jsonwebtoken';

export const generateToken = (userId: string | Types.ObjectId, res: Response): string => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }

    // Convertir ObjectId en string si nécessaire
    const userIdStr = typeof userId === 'string' ? userId : userId.toString();

    const token = jwt.sign({ userId: userIdStr }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    res.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development'
    });

    return token;
};