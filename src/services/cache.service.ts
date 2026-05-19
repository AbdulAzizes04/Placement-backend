import NodeCache from 'node-cache';

class CacheService {
    private cache: NodeCache;

    constructor(ttlSeconds: number = 300) {
        this.cache = new NodeCache({
            stdTTL: ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones: false
        });
    }

    get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    set<T>(key: string, value: T, ttl?: number): boolean {
        if (ttl) {
            return this.cache.set(key, value, ttl);
        }
        return this.cache.set(key, value);
    }

    del(key: string | string[]): number {
        return this.cache.del(key);
    }

    flush(): void {
        this.cache.flushAll();
    }

    // Helper for specialized analytics cache keys
    generateKey(prefix: string, params: Record<string, any>): string {
        const queryStr = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return `${prefix}:${queryStr}`;
    }
}

// Export a singleton instance with default 5-minute TTL
export const analyticsCache = new CacheService(300);
export default analyticsCache;
