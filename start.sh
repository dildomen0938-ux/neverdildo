#!/bin/bash
# Запуск обоих серверов на Railway

echo "Starting Neverlose servers..."

# Генерируем сертификат если нет
if [ ! -f server/cert.pem ]; then
    echo "Generating SSL certificate..."
    cd server
    openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem \
        -days 365 -nodes -subj "/CN=neverlose" 2>/dev/null || echo "OpenSSL not available"
    cd ..
fi

# Запускаем оба сервера (Railway будет слушать на одном порту)
# WSS и HTTP будут работать через один порт через Railway proxy
python server/http_server.py &
HTTP_PID=$!

echo "HTTP server started (PID: $HTTP_PID)"
echo "Server running on port $PORT"

# Ждем HTTP сервер
wait $HTTP_PID
