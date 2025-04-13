import { Request, Response } from 'express';

export const signup = (req: Request, res: Response) => {
    res.send('Signup route');
};
export const login = (req: Request, res: Response) => {
    res.send('Login route');
};

export const logout = (req: Request, res: Response) => {
    res.send('Logout route');
};