import { createClient, RedisClientType } from 'redis';

/**
 * Redis cache service for performance optimization
 */
export class CacheService {
  private static client: RedisClientType;
  private static isConnected: boolean = false;
  private static readonly DEFAULT_TTL = 3600; // 1 hour default cache time

  /**
   * Initialize the Redis client
   */
  static async init() {
    try {
      if (!this.client) {
        this.client = createClient({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
        });

        // Set up event handlers
        this.client.on('error', (err) => {
          console.error('Redis error:', err);
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          console.log('Redis connected');
          this.isConnected = true;
        });

        // Connect to Redis
        await this.client.connect();
      }
    } catch (error) {
      console.error('Redis connection error:', error);
      this.isConnected = false;
    }
  }

  /**
   * Get a value from cache
   * @param key - Cache key
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) return null;

      const data = await this.client.get(key);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set a value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (optional)
   */
  static async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      if (!this.isConnected) return false;

      const serialized = JSON.stringify(value);
      await this.client.set(key, serialized, { EX: ttl });
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Delete a value from cache
   * @param key - Cache key
   */
  static async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) return false;

      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  /**
   * Clear cache by pattern
   * @param pattern - Key pattern to match (e.g., "products:*")
   */
  static async clearByPattern(pattern: string): Promise<boolean> {
    try {
      if (!this.isConnected) return false;

      let cursor = 0;
      do {
        const reply = await this.client.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });
        
        cursor = reply.cursor;
        
        if (reply.keys.length) {
          await this.client.del(reply.keys);
        }
      } while (cursor !== 0);
      
      return true;
    } catch (error) {
      console.error('Redis clear pattern error:', error);
      return false;
    }
  }

  /**
   * Get or set cache with a factory function
   * If data exists in cache, return it
   * If not, call the factory function, cache the result, and return it
   * 
   * @param key - Cache key
   * @param factory - Function to generate data if not in cache
   * @param ttl - Time to live in seconds (optional)
   */
  static async getOrSet<T>(
    key: string, 
    factory: () => Promise<T>, 
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    try {
      if (!this.isConnected) return await factory();

      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) return cached;

      // Not in cache, generate data
      const data = await factory();
      
      // Store in cache
      await this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      console.error('Redis getOrSet error:', error);
      // On error, fall back to direct data retrieval
      return await factory();
    }
  }

  /**
   * Close the Redis connection
   */
  static async close() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
} 