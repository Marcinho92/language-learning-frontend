# 🚀 Szybkie wdrożenie na Railway

## Krok 1: Przygotowanie
1. Upewnij się, że kod jest w repozytorium GitHub
2. Sprawdź czy wszystkie pliki są commitowane

## Krok 2: Wdrożenie
1. Przejdź do [railway.app](https://railway.app)
2. Kliknij **"New Project"**
3. Wybierz **"Deploy from GitHub repo"**
4. Wybierz repozytorium z frontendem
5. Wybierz branch `main`

## Krok 3: Konfiguracja
1. W projekcie Railway przejdź do **"Variables"**
2. Dodaj zmienne:
   - **Key**: `GATEWAY_API_URL`
   - **Value**: `https://api-gateway-production-1b48.up.railway.app`
   
   - **Key**: `PORT`
   - **Value**: `3000`
   
   - **Key**: `NODE_OPTIONS`
   - **Value**: `--max-old-space-size=1024`

## Krok 4: Sprawdzenie
1. Poczekaj na zakończenie budowania
2. Sprawdź URL aplikacji
3. Przetestuj funkcjonalności

## ✅ Gotowe!
Frontend będzie dostępny pod adresem: `https://your-project-name.railway.app`

## 🔧 Rozwiązywanie problemów
- **Błąd budowania**: Sprawdź logi w "Deployments"
- **Błąd API**: Sprawdź czy backend działa
- **CORS**: Sprawdź czy backend ma włączone CORS dla domeny Railway
- **Pamięć**: Zwiększ `NODE_OPTIONS` do `--max-old-space-size=2048` jeśli potrzebne 