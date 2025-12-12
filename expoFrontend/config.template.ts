/**
 * Configuration Template
 * Copy this file to config.ts and fill in your actual values
 * DO NOT commit config.ts - it contains sensitive credentials
 */

export const config = {
  redis: {
    host: 'redis-13572.c304.europe-west1-2.gce.cloud.redislabs.com',
    port: 13572,
    password: '', // Required: Get from Redis Labs dashboard
    username: 'default', // Optional: Default user for Redis 6+
    tls: true, // Required for Redis Labs cloud instances
    db: 0, // Database number (0-15 typically)
  },
} as const;

export type Config = typeof config;
