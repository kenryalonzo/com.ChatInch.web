import User from '@/models/user.model';
import { Request, Response } from 'express';

import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/utils';

export const signup = async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password } = req.body;
    
    const handleError = (status: number, message: string) => res.status(status).json({ message });
    
    try {
        if (!fullName || !email || !password) {
            handleError(400, "All fields are required");
            return;
        }
        if (password.length < 6) {
            handleError(400, "Password must be at least 6 characters");
            return;
        }

        const user = await User.findOne({ email });
        if (user) {
            handleError(400, "Email already exists");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if (!newUser) {
            handleError(400, "Invalid user data");
            return;
        }

        generateToken(newUser._id, res);
        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            prolilePic: newUser.profilePic,
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error in signup controller", error.message);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            console.log("Error in signup controller", error);
        }
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({message: "Invalid credentials"});
            return; // Utilisez return seul sans retourner la réponse
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(400).json({ message: "Invalid credentials"});
            return;
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in login controller", error.message);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

export const logout = (req: Request, res: Response) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in logout controller", error.message);
            res.status(500).json({ message: "Invalid credentials" });
        } 
    }
};

