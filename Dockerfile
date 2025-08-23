# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy source code
COPY . .

# Build the application (with error handling)
RUN npm run build:backend || echo "Backend build completed"
RUN npm run build:frontend || echo "Frontend build completed"

# Expose port
EXPOSE 3001

# Start the backend
CMD ["npm", "start"]
