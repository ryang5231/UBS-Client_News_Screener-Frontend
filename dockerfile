# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Set environment variable for build
ENV NEXT_PUBLIC_API_URL=https://ubsfinalyearproject.wittyrock-7e120beb.southeastasia.azurecontainerapps.io
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Verify build output exists
RUN ls -la /app/out || (echo "Build failed - no out directory!" && exit 1)

# Production stage
FROM nginx:stable-alpine

# Create necessary directories and files
RUN mkdir -p /var/log/nginx/ && \
    touch /var/log/nginx/error.log && \
    touch /var/log/nginx/access.log && \
    chown -R nginx:nginx /var/log/nginx/ && \
    chmod -R 755 /var/log/nginx/

# Copy static files from builder
COPY --from=builder /app/out /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx && \
    chmod -R 755 /etc/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port 80
EXPOSE 80

# Simple health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]