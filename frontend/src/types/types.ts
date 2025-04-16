import { io } from "socket.io-client";

// types.ts
export interface User {
    username: string | undefined;
    name: string | undefined;
    _id: string;
    // name?: string; 
    fullName?: string;
    email?: string;
    profilePic?: string;
    createdAt?: string | Date;
    // Ajoutez d'autres propriétés utilisateur si nécessaire
  }
  
  export interface Message {
    _id: string;
    senderId: string;
    text?: string;
    image?: string;
    createdAt: string | Date;
  }
  
  export interface ApiError {
    response?: {
      data?: {
        message: string;
      };
    };
    message?: string;
  }

  export type SocketType = ReturnType<typeof io>