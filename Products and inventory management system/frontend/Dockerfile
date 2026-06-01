# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package configuration
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code and environment variables
COPY . .

# Build application
# Note: In production, inject VITE_API_URL via build args if needed
RUN npm run build

# Production stage using Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
