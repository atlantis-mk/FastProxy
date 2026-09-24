FROM --platform=${TARGETPLATFORM:-linux/amd64} docker.io/node:22-alpine AS builder

WORKDIR /build

RUN apk add --no-cache git python3 make g++ bash

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM docker.io/caddy:2-alpine

EXPOSE 80 443
WORKDIR /srv

COPY --from=builder /build/dist/. /srv/
COPY Caddyfile /etc/caddy/Caddyfile

ENV CADDY_ADMIN=0.0.0.0:2019

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
