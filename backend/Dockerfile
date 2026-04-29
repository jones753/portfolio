FROM node:20-slim AS deps
WORKDIR /app

RUN corepack enable
COPY package.json ./
RUN pnpm install --frozen-lockfile=false --prod

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY index.js package.json ./

EXPOSE 4000
CMD ["node", "index.js"]
