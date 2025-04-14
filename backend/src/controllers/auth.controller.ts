import User from '@/models/user.model';
import {  Response } from 'express';

import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/utils';
import clouadinary from '@/lib/cloudinary';

import { AuthRequest } from '@/types/express';

export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
    const { fullName, email, password } = req.body;
    
    try {
        if (!fullName || !email || !password) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        
        if (password.length < 6) {
            res.status(400).json({ message: "Password must be at least 6 characters" });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        generateToken(newUser._id, res);
        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        });

    } catch (error: unknown) {
        console.log("Error in signup controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(400).json({ message: "Invalid credentials" });
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
        console.log("Error in login controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req: AuthRequest, res: Response): void => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { profilePic } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!profilePic) {
            res.status(400).json({ message: "Profile pic is required" });
            return;
        }

        const uploadResponse = await clouadinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { profilePic: uploadResponse.secure_url }, 
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("Error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const checkAuth = (req: AuthRequest, res: Response): void => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};