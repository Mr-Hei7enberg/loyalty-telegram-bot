# syntax=docker/dockerfile:1.5

FROM node:18-slim AS builder
WORKDIR /app
ENV NODE_ENV=development

# Install dependencies first to leverage Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy project sources
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
COPY test ./test
COPY scripts ./scripts

# Build the NestJS application
RUN npm run build

FROM node:18-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled application from the builder stage
COPY --from=builder /app/dist ./dist
# Render задає змінну PORT, але залишаємо дефолт для локального запуску
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main"]
