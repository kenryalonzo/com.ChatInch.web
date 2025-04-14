import mongoose, { Document, Types } from "mongoose";

interface IUser {
    email: string;
    fullName: string;
    password: string;
    profilePic: string;
}

interface IUserDocument extends IUser, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUserDocument>(
    {
        email: { type: String, required: true, unique: true },
        fullName: { type: String, required: true },
        password: { type: String, required: true, minlength: 6 },
        profilePic: { type: String, default: "" }
    },
    { timestamps: true }
);

const User = mongoose.model<IUserDocument>("User", userSchema);

export default User;
export type { IUserDocument };