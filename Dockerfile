# Use Node.js 20 alpine for smaller image size
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next

# Copy necessary files for Next.js App Router to work
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/app ./app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S tech_user -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R tech_user:nodejs /app
USER tech_user

# Expose port (Cloud Run will provide PORT env var)
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]