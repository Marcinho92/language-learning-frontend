# Language Learning Frontend

Frontend aplikacji do nauki języków obcych, napisany w React z Material-UI.

## Funkcje

- **Learn Words**: Nauka słów z tłumaczeniami, przykładami użycia i wyjaśnieniami
- **Word List**: Lista wszystkich słów z możliwością wyszukiwania i sortowania
- **Add Word**: Dodawanie nowych słów do bazy danych
- **Edit Word**: Edycja istniejących słów

## Technologie

- **React 18**
- **Material-UI (MUI)**
- **React Router**
- **Axios** (dla komunikacji z API)

## Instalacja

### Wymagania
- Node.js 16+ 
- npm lub yarn

### Instalacja zależności
```bash
npm install
```

### Uruchomienie w trybie deweloperskim
```bash
npm start
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

### Budowanie aplikacji
```bash
npm run build
```

## Konfiguracja środowiska

Utwórz plik `.env` w głównym katalogu:

```env
REACT_APP_API_URL=http://localhost:8080
```

Dla produkcji ustaw URL backendu:
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

## Struktura projektu

```
src/
├── components/
│   ├── AddWord.js          # Komponent dodawania słów
│   ├── EditWord.js         # Komponent edycji słów
│   ├── Navigation.js       # Nawigacja aplikacji
│   ├── WordLearning.js     # Komponent nauki słów
│   └── WordList.js         # Lista słów z wyszukiwaniem
├── App.js                  # Główny komponent aplikacji
└── index.js                # Punkt wejścia aplikacji
```

## API Endpoints

Aplikacja komunikuje się z backendem przez następujące endpointy:

- `GET /api/words` - Pobieranie listy słów
- `GET /api/words/random` - Pobieranie losowego słowa
- `POST /api/words` - Dodawanie nowego słowa
- `PUT /api/words/{id}` - Aktualizacja słowa
- `DELETE /api/words/{id}` - Usuwanie słowa
- `POST /api/words/{id}/check` - Sprawdzanie tłumaczenia

## Deployment

### Railway
Aplikacja jest skonfigurowana do wdrożenia na Railway z plikiem `railway.json`.

### Docker
Można również wdrożyć używając Dockerfile:

```bash
docker build -t language-learning-frontend .
docker run -p 3000:3000 language-learning-frontend
```

## Rozwój

### Dodawanie nowych funkcji
1. Utwórz nowy komponent w `src/components/`
2. Dodaj routing w `App.js` jeśli potrzebne
3. Zaktualizuj nawigację w `Navigation.js`

### Style
Aplikacja używa Material-UI, więc style są definiowane przez komponenty MUI i `sx` prop.

## Licencja

MIT 