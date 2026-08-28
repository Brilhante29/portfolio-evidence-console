# syntax=docker/dockerfile:1.7
FROM node:24-bookworm-slim AS dependencies
ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_LOGLEVEL=error \
    NPM_CONFIG_UPDATE_NOTIFIER=false
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
WORKDIR /app
RUN groupadd --gid 1001 nodejs \
    && useradd --uid 1001 --gid nodejs --no-create-home --no-log-init --shell /usr/sbin/nologin nextjs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.js"]

FROM build AS benchmark
ARG SOURCE_COMMIT=0000000000000000000000000000000000000000
ENV BENCHMARK_SOURCE_COMMIT=${SOURCE_COMMIT} \
    BENCHMARK_CLEAN_TREE=true \
    BENCHMARK_PRODUCER=local \
    NEXT_TELEMETRY_DISABLED=1
RUN npx playwright install --with-deps chromium
CMD ["npm", "run", "benchmark"]

FROM runtime AS final
