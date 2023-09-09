import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  async setValue(key: string, value: string, ttl: number = 0) {
    return await this.redis.set(key, value, 'EX', ttl);
  }

  async getValue(key: string) {
    return await this.redis.get(key);
  }

  async del(key: string) {
    return await this.redis.del(key);
  }
}
