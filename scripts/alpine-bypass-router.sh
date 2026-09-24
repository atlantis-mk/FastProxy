#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
BIN_PATH="${FASTPROXY_BIN:-$ROOT_DIR/build/fastproxy-server}"
DATA_DIR="${FASTPROXY_SERVER_DATA_DIR:-/opt/fastproxy/data}"
ADDR="${FASTPROXY_SERVER_ADDR:-0.0.0.0:43171}"
LOG_FILE="${FASTPROXY_LOG_FILE:-/var/log/fastproxy.log}"
PID_FILE="${FASTPROXY_PID_FILE:-/var/run/fastproxy.pid}"
LOG_LEVEL="${FASTPROXY_SERVER_LOG_LEVEL:-info}"

mkdir -p "$(dirname -- "$LOG_FILE")" "$(dirname -- "$PID_FILE")" "$DATA_DIR"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/alpine-bypass-router.sh [start|stop|restart|status|logs]

Environment:
  FASTPROXY_BIN              binary path (default: ./build/fastproxy-server)
  FASTPROXY_SERVER_ADDR      bind address (default: 0.0.0.0:43171)
  FASTPROXY_SERVER_DATA_DIR  data dir (default: /opt/fastproxy/data)
  FASTPROXY_LOG_FILE         log file (default: /var/log/fastproxy.log)
  FASTPROXY_PID_FILE         pid file (default: /var/run/fastproxy.pid)
  FASTPROXY_SERVER_LOG_LEVEL log level (default: info)
EOF
}

ensure_binary() {
  if [ ! -x "$BIN_PATH" ]; then
    echo "Binary not found at $BIN_PATH, building it first..."
    (cd "$ROOT_DIR" && pnpm install --frozen-lockfile && pnpm build:binary)
  fi

  if [ ! -x "$BIN_PATH" ]; then
    echo "Failed to build FastProxy binary at $BIN_PATH" >&2
    exit 1
  fi
}

status() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "FastProxy is running with PID $(cat "$PID_FILE")"
    return 0
  fi

  echo "FastProxy is not running"
  return 1
}

start_service() {
  ensure_binary

  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "FastProxy is already running with PID $(cat "$PID_FILE")"
    return 0
  fi

  nohup env \
    FASTPROXY_SERVER_ADDR="$ADDR" \
    FASTPROXY_SERVER_DATA_DIR="$DATA_DIR" \
    FASTPROXY_SERVER_LOG_LEVEL="$LOG_LEVEL" \
    "$BIN_PATH" >"$LOG_FILE" 2>&1 &

  echo $! > "$PID_FILE"
  echo "FastProxy started. WebUI: http://$ADDR"
  echo "Data dir: $DATA_DIR"
  echo "Logs: $LOG_FILE"
}

stop_service() {
  if [ ! -f "$PID_FILE" ]; then
    echo "PID file not found: $PID_FILE"
    return 0
  fi

  pid=$(cat "$PID_FILE" || true)
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid"
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid"
    fi
  fi

  rm -f "$PID_FILE"
  echo "FastProxy stopped"
}

logs() {
  if [ -f "$LOG_FILE" ]; then
    tail -n 100 "$LOG_FILE"
  else
    echo "No log file found at $LOG_FILE"
  fi
}

case "${1:-start}" in
  start)
    start_service
    ;;
  stop)
    stop_service
    ;;
  restart)
    stop_service || true
    start_service
    ;;
  status)
    status
    ;;
  logs)
    logs
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    usage
    exit 1
    ;;
 esac
