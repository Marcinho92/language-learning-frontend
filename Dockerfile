FROM node:18-alpine

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=512"

# Kopiuj package.json i package-lock.json
COPY package*.json ./

# Zainstaluj wszystkie zależności (w tym devDependencies potrzebne do build)
RUN npm ci

# Kopiuj pliki konfiguracyjne
COPY vite.config.js ./
COPY index.html ./

# Kopiuj katalogi źródłowe
COPY src/ ./src/
COPY public/ ./public/

# Zbuduj aplikację (teraz vite jest dostępny)
RUN npm run build

# Ustaw NODE_ENV na production
ENV NODE_ENV=production

# Usuń devDependencies po build
RUN npm prune --production

# Eksponuj port
EXPOSE $PORT

# Uruchom serwer
CMD ["npm", "start"]