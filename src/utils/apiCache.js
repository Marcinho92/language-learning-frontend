// Cache dla API calls
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minut

// Cache dla static files
const staticCache = new Map();
const STATIC_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 godziny

export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

export const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

export const clearCache = () => {
  cache.clear();
};

export const getCacheKey = (url, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${url}${sortedParams ? '?' + sortedParams : ''}`;
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

// Automatyczne czyszczenie co 10 minut
setInterval(cleanupExpiredCache, 10 * 60 * 1000);
