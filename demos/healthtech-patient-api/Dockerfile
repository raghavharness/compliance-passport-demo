FROM node:20 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-slim

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

EXPOSE 3001

CMD ["node", "src/server.js"]
