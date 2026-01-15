/**
 * Backend Types - Barrel Export
 */

export * from './user';
export * from './coingecko';

/**
 * API Error Response
 */
export interface ApiError {
  message: string;
  stack?: string;
}

/**
 * Wishlist update request
 */
export interface WishlistUpdateRequest {
  coin: string;
  coin_id: string;
  user_email: string;
}

/**
 * Cache entry type
 */
export interface CacheEntry<T> {
  data: T;
  expiry: number;
}

/**
 * Environment variables type
 */
export interface EnvironmentConfig {
  MONGO_URL: string;
  JWT_SECRET: string;
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  COINGECKO_API_KEY?: string;
}
