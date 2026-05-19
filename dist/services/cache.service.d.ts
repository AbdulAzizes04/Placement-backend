declare class CacheService {
    private cache;
    constructor(ttlSeconds?: number);
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T, ttl?: number): boolean;
    del(key: string | string[]): number;
    flush(): void;
    generateKey(prefix: string, params: Record<string, any>): string;
}
export declare const analyticsCache: CacheService;
export default analyticsCache;
//# sourceMappingURL=cache.service.d.ts.map