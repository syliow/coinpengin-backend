import { Document, Types } from 'mongoose';
import { Request } from 'express';

/**
 * User Document Interface
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  wishlist: string[];
  createdAt: Date;
  updatedAt: Date;
  addToWishlist(coinName: string): Promise<IUser>;
  removeFromWishlist(coinName: string): Promise<IUser>;
}

/**
 * User input for registration
 */
export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * User input for login
 */
export interface LoginUserInput {
  email: string;
  password: string;
}

/**
 * User response (without password)
 */
export interface UserResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  token?: string;
}

/**
 * Authenticated request with user
 */
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}
