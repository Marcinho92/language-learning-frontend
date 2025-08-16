// Cache dla API calls - zoptymalizowany dla nowego backendu z Redis
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minut - zgodne z Redis TTL

// Cache dla static files
const staticCache = new Map();
const STATIC_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 godziny

// Monitoring cache
let cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  clears: 0
};

export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    cacheStats.hits++;
    return cached.data;
  }
  cacheStats.misses++;
  return null;
};

export const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  cacheStats.sets++;
};

export const clearCache = () => {
  cache.clear();
  cacheStats.clears++;
};

export const getCacheKey = (url, params = {}) => {
  // Filtruj puste parametry
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  // Sortuj parametry dla spójności kluczy
  const sortedParams = Object.keys(filteredParams)
    .sort()
    .map(key => `${key}=${filteredParams[key]}`)
    .join('&');
  
  return `${url}${sortedParams ? '?' + sortedParams : ''}`;
};

// Funkcja do czyszczenia cache dla konkretnego wzorca URL
export const clearCacheByPattern = (pattern) => {
  const keysToDelete = [];
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => cache.delete(key));
  cacheStats.clears += keysToDelete.length;
};

// Funkcja do czyszczenia cache dla konkretnych parametrów
export const clearCacheByParams = (baseUrl, params = {}) => {
  const pattern = getCacheKey(baseUrl, params);
  clearCacheByPattern(pattern);
};

// Cache dla static files
export const getStaticCache = (key) => {
  const cached = staticCache.get(key);
  if (cached && Date.now() - cached.timestamp < STATIC_CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

export const setStaticCache = (key, data) => {
  staticCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Funkcja do czyszczenia expired cache'ów
export const cleanupExpiredCache = () => {
  const now = Date.now();
  
  // Czyszczenie API cache
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
  
  // Czyszczenie static cache
  for (const [key, value] of staticCache.entries()) {
    if (now - value.timestamp > STATIC_CACHE_DURATION) {
      staticCache.delete(key);
    }
  }
};

// Funkcje do monitorowania cache (odpowiednik /actuator/caches)
export const getCacheStats = () => {
  return {
    ...cacheStats,
    size: cache.size,
    staticSize: staticCache.size,
    hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0,
    memoryUsage: {
      api: cache.size,
      static: staticCache.size
    }
  };
};

export const getCacheKeys = () => {
  return {
    api: Array.from(cache.keys()),
    static: Array.from(staticCache.keys())
  };
};

export const resetCacheStats = () => {
  cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    clears: 0
  };
};

// Automatyczne czyszczenie co 10 minut
setInterval(cleanupExpiredCache, 10 * 60 * 1000);

// Logowanie statystyk cache co 5 minut (dla debugowania)
setInterval(() => {
  const stats = getCacheStats();
  if (stats.size > 0 || stats.staticSize > 0) {
    console.log('Cache Stats:', {
      size: stats.size,
      staticSize: stats.staticSize,
      hitRate: (stats.hitRate * 100).toFixed(2) + '%',
      hits: stats.hits,
      misses: stats.misses
    });
  }
}, 5 * 60 * 1000);
