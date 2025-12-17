FROM node:lts-alpine

# Install all dependencies (including devDependencies for building)
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Create non-root user and set permissions
RUN chown -R node:node /usr/src/app
USER node

# Expose the correct port (matches main.ts default)
EXPOSE 3001

# Use production start command
CMD ["npm", "run", "start:prod"]
