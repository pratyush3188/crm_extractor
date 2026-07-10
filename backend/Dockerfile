# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for node-gyp or other native modules if any
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript compiler)
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies to keep the image lean
RUN npm install --omit=dev

# Copy compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the backend port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
