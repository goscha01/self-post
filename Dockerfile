# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci
RUN cd backend && npm ci

# Copy source code
COPY . .

# Build backend only
RUN npm run build:backend

# Expose port
EXPOSE 3001

# Start the backend API
CMD ["npm", "start"]
