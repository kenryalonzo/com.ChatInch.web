// Removed unused import of 'Types' from 'mongoose'
import { Request } from 'express';
import { IUserDocument } from '@/models/user.model'; // Assurez-vous que cette interface existe

declare global {
    namespace Express {
        interface Request {
            user?: IUserDocument;
        }
    }
}

export interface AuthRequest extends Request {
    user?: IUserDocument;
}