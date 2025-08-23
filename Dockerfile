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

# Build backend first
RUN npm run build:backend

# Build frontend
RUN npm run build:frontend

# Create directory for frontend files in backend
RUN mkdir -p backend/dist/frontend

# Copy built frontend files to backend
RUN cp -r frontend/.next backend/dist/frontend/
RUN cp -r frontend/public backend/dist/frontend/

# Verify files are copied
RUN ls -la backend/dist/frontend/
RUN ls -la backend/dist/frontend/.next/

# Expose port
EXPOSE 3001

# Start the backend (which will serve both API and frontend)
CMD ["npm", "start"]
