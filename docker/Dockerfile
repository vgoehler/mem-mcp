FROM node:22-alpine AS build

WORKDIR /app

# Copy files
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src

# Install deps
RUN npm ci

# Build sources
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package.json package-lock.json ./
COPY --from=build /app/build ./build
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

RUN addgroup -S app && adduser -S app -G app
USER app

# MCP server uses stdio, so no ports needed
ENTRYPOINT ["node", "build/index.js"]
