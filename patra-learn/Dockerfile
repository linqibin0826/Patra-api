# patra-learn 运行镜像（Next.js 15 standalone Node server）
# 三阶段：deps（装依赖，缓存层）→ builder（next build，standalone trace）→ runner（精简运行镜像）。
# 用法：docker build -f patra-learn/Dockerfile patra-learn

FROM node:24-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm@10
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@10
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4001 \
    HOSTNAME=0.0.0.0
RUN addgroup -g 10001 -S nodejs \
    && adduser -u 10001 -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 4001
CMD ["node", "server.js"]
