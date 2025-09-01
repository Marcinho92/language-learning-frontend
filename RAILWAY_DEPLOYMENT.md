# Instrukcja wdrożenia Language Learning Frontend na Railway

## Wymagania wstępne

1. **Konto Railway**: Zarejestruj się na [railway.app](https://railway.app)
2. **GitHub**: Kod musi być w repozytorium GitHub
3. **Backend**: Backend musi być już wdrożony na Railway

## Krok 1: Przygotowanie kodu

### 1.1 Sprawdź plik `.env` dla produkcji
Upewnij się, że w kodzie jest fallback dla URL API Gateway:

```javascript
const apiUrl = process.env.GATEWAY_API_URL || 'https://api-gateway-production-1b48.up.railway.app';
```

### 1.2 Sprawdź `package.json`
Upewnij się, że masz wszystkie potrzebne skrypty:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## Krok 2: Wdrożenie na Railway

### 2.1 Utwórz nowy projekt na Railway

1. Przejdź do [railway.app](https://railway.app)
2. Kliknij **"New Project"**
3. Wybierz **"Deploy from GitHub repo"**
4. Wybierz repozytorium z frontendem
5. Wybierz branch (zazwyczaj `main` lub `master`)

### 2.2 Skonfiguruj zmienne środowiskowe

W projekcie Railway:

1. Przejdź do zakładki **"Variables"**
2. Dodaj zmienną środowiskową:
   - **Key**: `GATEWAY_API_URL`
   - **Value**: `https://api-gateway-production-1b48.up.railway.app`

### 2.3 Skonfiguruj domenę (opcjonalnie)

1. Przejdź do zakładki **"Settings"**
2. W sekcji **"Domains"** możesz:
   - Użyć automatycznie wygenerowanej domeny Railway
   - Lub dodać własną domenę

## Krok 3: Weryfikacja wdrożenia

### 3.1 Sprawdź logi budowania

1. Przejdź do zakładki **"Deployments"**
2. Sprawdź logi budowania - powinny wyglądać mniej więcej tak:
   ```
   Installing dependencies...
   Building the app...
   Compiled successfully!
   ```

### 3.2 Testuj aplikację

1. Otwórz URL aplikacji
2. Sprawdź czy:
   - Strona się ładuje
   - Możesz przejść między zakładkami
   - Komunikacja z backendem działa

## Krok 4: Rozwiązywanie problemów

### Problem: Błąd budowania
**Rozwiązanie:**
- Sprawdź logi w zakładce **"Deployments"**
- Upewnij się, że wszystkie zależności są w `package.json`
- Sprawdź czy nie ma błędów składni w kodzie

### Problem: Błąd 404 na endpointach API
**Rozwiązanie:**
- Sprawdź czy `GATEWAY_API_URL` jest poprawnie ustawiony
- Upewnij się, że backend działa na podanym URL
- Sprawdź czy backend ma włączone CORS

### Problem: Aplikacja się nie ładuje
**Rozwiązanie:**
- Sprawdź logi w zakładce **"Deployments"**
- Upewnij się, że `startCommand` w `railway.json` jest poprawny
- Sprawdź czy port 3000 jest dostępny

## Krok 5: Aktualizacje

### 5.1 Automatyczne wdrożenia
Railway automatycznie wdraża nowe wersje gdy:
- Pushujesz zmiany do brancha `main`
- Lub gdy ręcznie wywołasz redeploy

### 5.2 Ręczne wdrożenie
1. Przejdź do zakładki **"Deployments"**
2. Kliknij **"Deploy Now"**

## Konfiguracja CORS (jeśli potrzebna)

Jeśli backend ma problemy z CORS, upewnij się, że w backendzie jest:

```java
@CrossOrigin(origins = {
    "http://localhost:3000", 
    "https://your-frontend-url.railway.app"
})
```

## Przydatne komendy

### Sprawdź status wdrożenia
```bash
# W Railway Dashboard -> Deployments
```

### Sprawdź logi
```bash
# W Railway Dashboard -> Deployments -> View Logs
```

### Zmień zmienne środowiskowe
```bash
# W Railway Dashboard -> Variables
```

## Struktura plików dla Railway

```
language-learning-frontend/
├── package.json          # Zależności i skrypty
├── railway.json          # Konfiguracja Railway
├── public/
│   └── index.html        # Główny plik HTML
├── src/
│   ├── App.js           # Główny komponent
│   ├── index.js         # Punkt wejścia
│   └── components/      # Komponenty React
└── README.md            # Dokumentacja
```

## URL końcowe

Po wdrożeniu będziesz mieć:
- **Frontend**: `https://your-project-name.railway.app`
- **API Gateway**: `https://api-gateway-production-1b48.up.railway.app`

## Wsparcie

Jeśli napotkasz problemy:
1. Sprawdź logi w Railway Dashboard
2. Sprawdź dokumentację Railway
3. Sprawdź czy backend działa poprawnie 