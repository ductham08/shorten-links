import { Schema, model, models, Document } from "mongoose";

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    refreshToken?: string;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "user" },
    refreshToken: { type: String },
});

// Check if the model already exists before defining it
const User = models.User || model<IUser>("User", userSchema);

export default User;