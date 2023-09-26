FROM docker.io/node:20 AS base
 
RUN apt-get update
RUN apt-get install -y build-essential

RUN corepack enable

# stupid pnpm and docker and such
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS builder
# Set working directory
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune --scope=web --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install
 
# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=web...
 
FROM docker.io/base AS runner
WORKDIR /app
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
 
COPY --from=installer /app/apps/web/next.config.js .
COPY --from=installer /app/apps/web/package.json .
 
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
 
CMD node apps/web/server.js