# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=8002
ENV NODE_ENV=production

# Copy built artifacts from host (CI/local build)
COPY .output .output

# Start command
CMD ["node", ".output/server/index.mjs"]
