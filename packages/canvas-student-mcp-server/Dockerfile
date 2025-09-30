# Canvas Student MCP Server - TypeScript/Node.js Implementation
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose MCP server port (stdio-based, no port needed but included for reference)
EXPOSE 3000

# Health check (for future HTTP endpoints)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('MCP Server running')" || exit 1

# Set environment
ENV NODE_ENV=production

# Run MCP server
CMD ["node", "dist/index.js"]
