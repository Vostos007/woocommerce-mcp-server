FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary files
COPY .env.example ./

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Set user to non-root for security
USER node

# Start the application
CMD ["node", "dist/index.js"]
