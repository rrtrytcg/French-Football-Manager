# Production Dockerfile - single image serves client + server
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm ci --workspace=client && npm ci --workspace=server

COPY . .
RUN npm run build --workspace=client

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./server/public
COPY package*.json ./
RUN npm ci --omit=dev --workspace=server
EXPOSE 3001
CMD ["node", "server/src/index.js"]
