FROM node:22-slim

# Set the working directory
WORKDIR /apps
COPY . .

# Install dependencies
RUN npm install

# Generate variables URLs
ARG VITE_API_BASE_URL
ARG VITE_BACKEND_WEBSOCKET
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BACKEND_WEBSOCKET=$VITE_BACKEND_WEBSOCKET

# Build the app for production
RUN npm run build

# Install a static server
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "3000"]
