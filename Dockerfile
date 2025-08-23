# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
COPY backend/package-lock.json ./backend/
COPY frontend/package-lock.json ./frontend/
RUN npm ci
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy source code
COPY . .

# Build both backend and frontend
RUN npm run build:backend
RUN npm run build:frontend

# Create directory for frontend files in backend
RUN mkdir -p backend/dist/frontend

# Copy built frontend files to backend
RUN cp -r frontend/.next backend/dist/frontend/
RUN cp -r frontend/public backend/dist/frontend/

# Expose port
EXPOSE 3001

# Start the backend (which will serve both API and frontend)
CMD ["npm", "start"]
