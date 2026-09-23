FROM --platform=$BUILDPLATFORM docker.io/guergeiro/pnpm:lts-latest AS builder

WORKDIR /build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM docker.io/caddy:alpine

# Caddy is the Alpine panel runtime. The Go backend binary uses
# FASTPROXY_SERVER_ADDR=0.0.0.0:8080 by default when run directly.
EXPOSE 8080
WORKDIR /srv
COPY --from=builder /build/dist/. .
COPY Caddyfile .

CMD ["caddy", "run", "--config", "/srv/Caddyfile", "--adapter", "caddyfile"]
