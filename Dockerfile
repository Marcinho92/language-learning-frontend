FROM node:18-alpine

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=512"
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install

COPY src/ src/
COPY index.html ./
COPY vite.config.js ./
COPY server.js ./

EXPOSE $PORT

# Build i uruchom przez Express
CMD ["sh", "-c", "npm run build && npm start"]