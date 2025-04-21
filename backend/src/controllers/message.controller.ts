import { Response } from 'express';
import User from "../models/user.model";
import Message from "../models/message.model";
import cloudinary from "../lib/cloudinary";
import { getReceiverSocketId, io } from "../lib/socket";
import { AuthRequest } from "../types/express";

export const getUsersForSidebar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loggedInUserId = req.user?._id;
    
    if (!loggedInUserId) {
      res.status(401).json({ error: "Unauthorized - User not authenticated" });
      return;
    }

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in getUsersForSidebar: ", errorMessage);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user?._id;

    if (!senderId) {
      res.status(401).json({ error: "Unauthorized - User not authenticated" });
      return;
    }

    const messages = await Message.find({
      $or: [
        { senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 }); // Tri par date croissante

    res.status(200).json(messages);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log("Error in getMessages controller: ", errorMessage);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user?._id;

    // Validation des données
    if (!senderId) {
      res.status(401).json({ error: "Unauthorized - User not authenticated" });
      return;
    }

    if (!receiverId) {
      res.status(400).json({ error: "Receiver ID is required" });
      return;
    }

    if (!text && !image) {
      res.status(400).json({ error: "Message content or image is required" });
      return;
    }

    // Traitement de l'image
    let imageUrl: string | undefined;
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error: ", uploadError);
        throw new Error("Failed to upload image");
      }
    }


    // Création du message
    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || null,
      image: imageUrl || null,
    });

    await newMessage.save();

    // Notification via Socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log("Error in sendMessage controller: ", errorMessage);
    res.status(500).json({ 
      error: "Internal server error",
      details: errorMessage 
    });
  }
};