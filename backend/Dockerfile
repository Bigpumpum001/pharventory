# ---------- Build stage ----------
FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ---------- Production stage ----------
FROM node:lts-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

USER node

# Expose the correct port (matches main.ts default)
EXPOSE 3001

CMD ["node", "dist/main.js"]