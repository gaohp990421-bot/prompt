# Use Node.js 20 Alpine as base
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Enable corepack for pnpm support
RUN corepack enable

# Build stage
FROM base AS build

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Release stage
FROM base AS release

# Copy only necessary files from build stage
COPY --from=build /app/.output /app/.output

# Expose port
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Start command
CMD ["node", ".output/server/index.mjs"]
