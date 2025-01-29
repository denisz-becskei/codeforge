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
RUN find /app -not -path "/app/node_modules/*" -not -path "/app/node_modules" -exec chown node:node {} +

# Build the project
RUN npm run build

# Switch to non-root user
USER node

CMD ["npm", "start"]