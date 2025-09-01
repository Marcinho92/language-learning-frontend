// Konfiguracja API Gateway
export const API_CONFIG = {
  // Base URL dla API Gateway (bez portu - używa standardowego HTTPS)
  BASE_URL: process.env.GATEWAY_API_URL || 'https://api-gateway-production-1b48.up.railway.app',
  
  // Endpointy dla słów
  WORDS: {
    LIST: '/api/words',
    PAGINATED: '/api/words/paginated',
    RANDOM: '/api/words/random',
    CREATE: '/api/words',
    GET_BY_ID: (id) => `/api/words/${id}`,
    UPDATE: (id) => `/api/words/${id}`,
    DELETE: (id) => `/api/words/${id}`,
    CHECK: (id) => `/api/words/${id}/check`,
    BULK_DELETE: '/api/words/bulk-delete',
    IMPORT_CSV: '/api/words/import/csv',
    GRAMMAR_PRACTICE: '/api/words/grammar-practice',
    GRAMMAR_VALIDATE: '/api/words/grammar-practice/validate'
  },
  
  // Endpointy dla ćwiczeń
  PRACTICE: {
    GENERATE: '/api/practice/generate',
    VERIFY: '/api/practice/verify'
  },
  
  // Endpointy dla monitoringu
  MONITORING: {
    CACHES: '/actuator/caches',
    METRICS: '/actuator/metrics',
    HEALTH: '/actuator/health'
  }
};

// Funkcja do budowania pełnych URL-i
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Funkcja do dodawania parametrów do URL
export const buildApiUrlWithParams = (endpoint, params = {}) => {
  const url = new URL(buildApiUrl(endpoint));
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};
