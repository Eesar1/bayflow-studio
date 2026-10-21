FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
RUN addgroup -S bayflow && adduser -S bayflow -G bayflow
COPY --from=builder --chown=bayflow:bayflow /app/.next/standalone ./
COPY --from=builder --chown=bayflow:bayflow /app/.next/static ./.next/static
COPY --from=builder --chown=bayflow:bayflow /app/public ./public
USER bayflow
EXPOSE 3000
CMD ["node", "server.js"]
