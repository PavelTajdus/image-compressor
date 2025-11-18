FROM node:20-alpine AS builder

# Install build dependencies for sharp and libheif
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libheif \
    libheif-dev \
    vips-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:20-alpine

# Install runtime dependencies for sharp with HEIC support
RUN apk add --no-cache \
    libheif \
    vips

WORKDIR /app

# Copy built application
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.svelte-kit ./.svelte-kit
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Start the application
CMD ["node", "build"]
