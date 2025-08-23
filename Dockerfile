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

# Build frontend with static export
RUN npm run build:frontend

# Create directory for frontend files in backend
RUN mkdir -p backend/dist/frontend

# Copy exported static files to backend
RUN cp -r frontend/out/* backend/dist/frontend/

# Also copy to a simpler location for easier access
RUN cp -r frontend/out/* backend/dist/

# Verify files are copied
RUN ls -la backend/dist/
RUN ls -la backend/dist/frontend/ || echo "frontend subdirectory not created"

# Expose port
EXPOSE 3001

# Start the backend (which will serve both API and frontend)
CMD ["npm", "start"]
