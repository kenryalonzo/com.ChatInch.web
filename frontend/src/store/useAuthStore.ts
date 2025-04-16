import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { User, SocketType, ApiError } from "../types/types";

interface AuthStoreState {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
  socket: SocketType | null;
  
  checkAuth: () => Promise<void>;
  signup: (data: { username: string; email: string; password: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get<User>("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error: unknown) {
      const err = error as ApiError;
      console.log("Error in checkAuth:", err);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post<User>("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post<User>("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || "An error occurred");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put<User>("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      const err = error as ApiError;
      console.log("error in update profile:", err);
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket });

    socket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
  },
}));