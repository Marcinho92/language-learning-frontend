# Language Learning Frontend

Frontend aplikacji do nauki języków obcych z obsługą nowych funkcjonalności backendu: **paginacji**, **cache Redis** i **optymalizacji**.

## 🚀 Nowe Funkcjonalności

### ✅ Paginacja
- **Nowy endpoint**: `/api/words/paginated` z parametrami `page`, `size`, `sortBy`, `sortDir`
- **Paginacja po stronie serwera** - lepsza wydajność dla dużych zbiorów danych
- **Parametry sortowania** - sortowanie po dowolnym polu (asc/desc)
- **Filtrowanie** - język i wyszukiwanie tekstowe

### ✅ Cache Redis
- **TTL 5 minut** - zgodne z backendem
- **Prefiks kluczy** - `words:` dla lepszej organizacji
- **Monitoring** - `/actuator/caches` i `/actuator/metrics`
- **Cache annotations** - `@Cacheable` dla wszystkich endpointów

### ✅ Optymalizacje
- **JPA custom queries** - lepsza wydajność bazy danych
- **Lazy loading** - komponenty ładowane na żądanie
- **Service Worker** - offline caching i network strategies
- **Progressive Web App** - manifest i offline capabilities

## 🛠️ Technologie

- **React 18** - z hooks i functional components
- **Material-UI (MUI)** - nowoczesny design system
- **React Router DOM** - nawigacja SPA
- **Vite** - szybki bundler z SSR support
- **Service Worker** - offline caching
- **Custom Cache System** - client-side caching z monitoringiem

## 📱 Komponenty

### Core Components
- `WordList` - lista słów z paginacją i cache
- `WordLearning` - nauka słów z losowym wyborem
- `AddWord` - dodawanie nowych słów
- `EditWord` - edycja istniejących słów
- `Practice` - ćwiczenia gramatyczne i weryfikacja
- `GrammarPractice` - praktyka gramatyczna
- `CacheMonitor` - monitoring i zarządzanie cache

### Cache System
- **API Cache** - 5 minut TTL dla endpointów
- **Static Cache** - 24 godziny dla plików statycznych
- **Pattern-based clearing** - czyszczenie cache po wzorcach
- **Statistics** - hit rate, misses, operations
- **Monitoring** - real-time cache performance

## 🔧 Konfiguracja

### Environment Variables
```bash
GATEWAY_API_URL=https://api-gateway-production-1b48.up.railway.app
```

### Cache Configuration
```javascript
// TTL zgodne z Redis backend
const CACHE_DURATION = 5 * 60 * 1000; // 5 minut
const STATIC_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 godziny
```

## 📊 API Endpoints

### Words Management
- `GET /api/words` - wszystkie słowa (z cache)
- `GET /api/words/paginated` - słowa z paginacją
- `POST /api/words` - dodanie nowego słowa
- `PUT /api/words/:id` - aktualizacja słowa
- `DELETE /api/words/:id` - usunięcie słowa
- `GET /api/words/random` - losowe słowo (bez cache)

### Practice & Learning
- `POST /api/practice/generate` - generowanie ćwiczeń
- `POST /api/practice/verify` - weryfikacja tłumaczeń
- `POST /api/words/:id/check` - sprawdzenie tłumaczenia

### Cache Management
- `GET /actuator/caches` - backend cache info
- `GET /actuator/metrics` - backend metrics
- `/cache` - frontend cache monitor

## 🚀 Uruchomienie

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Cache Monitoring
Otwórz `/cache` w aplikacji aby zobaczyć:
- Statystyki cache (hit rate, misses, operations)
- Lista kluczy cache
- Zarządzanie cache (clear, reset)
- Performance metrics

## 📈 Performance Features

### Lazy Loading
- Komponenty ładowane na żądanie
- Code splitting z React.lazy
- Suspense fallbacks

### Caching Strategy
- **Network First** - dla API calls
- **Cache First** - dla static files
- **Critical Files** - natychmiastowe cache'owanie

### Service Worker
- Offline support
- Background sync
- Push notifications ready

## 🔍 Monitoring & Debugging

### Cache Statistics
- Hit rate percentage
- Cache hits/misses count
- Memory usage
- Operation counters

### Performance Metrics
- Loading states
- Error handling
- Network requests
- Cache performance

## 🎯 Backend Integration

### Pagination Support
```javascript
// Przykład użycia paginacji
const params = new URLSearchParams({
  page: 0,
  size: 20,
  sortBy: 'id',
  sortDir: 'asc'
});

const response = await fetch(`/api/words/paginated?${params}`);
```

### Cache Invalidation
```javascript
// Czyszczenie cache po operacjach
clearCacheByPattern('/api/words');
clearCacheByPattern('/api/practice');
```

## 📝 Changelog

### v0.1.0
- ✅ Paginacja z nowym endpointem `/api/words/paginated`
- ✅ Cache Redis z TTL 5 minut
- ✅ Optymalizacja JPA i custom queries
- ✅ Monitoring cache przez `/actuator/caches`
- ✅ Cache annotations dla wszystkich endpointów
- ✅ Lazy loading komponentów
- ✅ Service Worker z offline support
- ✅ Cache Monitor komponent
- ✅ Performance optimizations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Marcinho92** - Language Learning Application

---

*Zaktualizowano dla nowej wersji backendu z paginacją, cache Redis i optymalizacjami* 🚀 