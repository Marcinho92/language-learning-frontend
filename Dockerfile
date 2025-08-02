FROM node:18-alpine

WORKDIR /app

# Set Node memory limit
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source directory
COPY src/ src/

# Copy index.html
COPY index.html ./

# Copy vite config
COPY vite.config.js ./

EXPOSE 3000

CMD ["npm", "start"] 