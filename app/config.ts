/**
 * Application Configuration
 * This file contains sensitive credentials - never commit to git
 */

export const config = {
  redis: {
    host: 'redis-13572.c304.europe-west1-2.gce.cloud.redislabs.com',
    port: 13572,
    password: 'tkc1jnw6WZB@hqu7cmq',
    username: 'app_v0.1',
    tls: true,
    db: 0,
  },
} as const;

export type Config = typeof config;
