const cache = new Map();

// 写缓存
const setCache = (key, cachedData) => {
    cache.set(key, {
        ...cachedData
    });
};

// 读缓存
const getCache = key => {
    return cache.get(key);
};

// 清楚缓存
const clearCache = key => {
    if (key) {
        const cacheKeys = Array.isArray(key) ? key : [key];
        cacheKeys.forEach(cacheKey => cache.delete(cacheKey));
    } else {
        cache.clear();
    }
};
export { getCache, setCache, clearCache };