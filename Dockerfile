FROM node:18-alpine

WORKDIR /app

# Set Node memory limit and suppress deprecation warnings
ENV NODE_OPTIONS="--max-old-space-size=4096 --no-deprecation"

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source directory
COPY src/ src/

# Copy index.html
COPY index.html ./

# Copy vite config
COPY vite.config.js ./

EXPOSE 3000

CMD ["npm", "start"] 