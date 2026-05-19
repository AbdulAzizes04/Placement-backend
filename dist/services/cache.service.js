"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsCache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
class CacheService {
    constructor(ttlSeconds = 300) {
        this.cache = new node_cache_1.default({
            stdTTL: ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones: false
        });
    }
    get(key) {
        return this.cache.get(key);
    }
    set(key, value, ttl) {
        if (ttl) {
            return this.cache.set(key, value, ttl);
        }
        return this.cache.set(key, value);
    }
    del(key) {
        return this.cache.del(key);
    }
    flush() {
        this.cache.flushAll();
    }
    // Helper for specialized analytics cache keys
    generateKey(prefix, params) {
        const queryStr = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return `${prefix}:${queryStr}`;
    }
}
// Export a singleton instance with default 5-minute TTL
exports.analyticsCache = new CacheService(300);
exports.default = exports.analyticsCache;
//# sourceMappingURL=cache.service.js.map