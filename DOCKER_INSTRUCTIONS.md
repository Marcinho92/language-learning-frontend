# Instrukcje uruchamiania Language Learning Frontend z Dockerem

## Uruchamianie tylko frontendu

### 1. Uruchom frontend
```bash
docker-compose up --build
```

Frontend będzie dostępny pod adresem: **http://localhost:3000**

### 2. Zatrzymanie frontendu
```bash
docker-compose down
```

## Uruchamianie z backendem

### Opcja 1: Backend lokalnie
1. Uruchom backend lokalnie (Spring Boot) na porcie 8080
2. Uruchom frontend: `docker-compose up --build`

### Opcja 2: Backend przez Docker
1. W katalogu `../language-learning-backend` uruchom:
   ```bash
   docker-compose up --build
   ```
2. W katalogu frontendu uruchom:
   ```bash
   docker-compose up --build
   ```

## Konfiguracja

### Zmiana URL backendu
Edytuj plik `docker-compose.yml` i zmień zmienną środowiskową:
```yaml
environment:
  - GATEWAY_API_URL=http://localhost:8080  # lub inny URL
```

### Porty
- **Frontend**: 3000
- **Backend**: 8080 (jeśli uruchomiony lokalnie)
- **PostgreSQL**: 5432 (jeśli uruchomiony przez backend)
- **PgAdmin**: 5050 (jeśli uruchomiony przez backend)

## Rozwiązywanie problemów

### Problem z komunikacją z backendem
1. Sprawdź czy backend działa na porcie 8080
2. Sprawdź czy URL w `GATEWAY_API_URL` jest poprawny
3. Sprawdź logi: `docker-compose logs frontend`

### Problem z pustą listą słów
Jeśli widzisz błąd 500 przy próbie pobrania losowego słowa z pustej listy:
1. Dodaj kilka słów przez zakładkę "Add Word"
2. Lub sprawdź czy backend ma poprawną obsługę wyjątków

### Resetowanie aplikacji
```bash
# Zatrzymaj wszystkie kontenery
docker-compose down

# Usuń obrazy (opcjonalnie)
docker rmi language-learning-frontend

# Uruchom ponownie
docker-compose up --build
``` 