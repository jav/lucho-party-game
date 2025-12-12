# Redis Configuration

## Required Information

To connect to your Redis database, you need:

### 1. **Host & Port** ✅
- Host: `redis-13572.c304.europe-west1-2.gce.cloud.redislabs.com`
- Port: `13572`

### 2. **Password** ⚠️ REQUIRED
- Get from: Redis Labs dashboard → Database → Configuration → Security
- This is the primary authentication credential

### 3. **TLS/SSL** ✅
- Cloud Redis instances require TLS encryption
- Set `tls: true` in config

### 4. **Username** (Optional)
- Redis 6+ supports ACL with usernames
- Default: `'default'`
- Can create custom users with specific permissions

### 5. **Database Number**
- Redis supports 16 databases (0-15)
- Default: `0`

## Setup Instructions

1. **Copy the template:**
   ```bash
   cp config.template.ts config.ts
   ```

2. **Add your Redis password:**
   - Open `config.ts`
   - Replace empty password string with your actual Redis password
   - Get password from: https://app.redislabs.com → Your Database → Configuration

3. **Install Redis client:**
   ```bash
   npm install ioredis
   ```

4. **Never commit config.ts:**
   - Already added to `.gitignore`
   - Only commit `config.template.ts`

## Security Best Practices

- ✅ Store password in `config.ts` (gitignored)
- ✅ Use environment variables for production
- ✅ Enable TLS for all connections
- ✅ Use Redis ACL for fine-grained permissions
- ✅ Rotate passwords regularly
- ❌ Never hardcode passwords in committed files
- ❌ Never share config.ts publicly

## Example Usage

```typescript
import { config } from './config';
import Redis from 'ioredis';

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  username: config.redis.username,
  tls: config.redis.tls ? {} : undefined,
  db: config.redis.db,
});

// Write
await redis.set('key', 'value');

// Read
const value = await redis.get('key');

// Protect with try-catch
try {
  await redis.set('game:123:state', JSON.stringify(gameState));
} catch (error) {
  console.error('Redis error:', error);
}
```
