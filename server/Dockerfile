FROM node:18-alpine

WORKDIR /app

# Create app and data directories with proper permissions
RUN mkdir -p /app /data && \
    chown -R node:node /app && \
    chown -R node:node /data

# Install dependencies as root
COPY package*.json ./
RUN npm install

# Copy files as root
COPY . .

# Change ownership of all files to node user
RUN chown -R node:node /app

# Build the project
RUN npm run build && \
    chown -R node:node /app

# Switch to non-root user
USER node

CMD ["npm", "start"]