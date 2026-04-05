# Neverlose Server на Railway

## Что это
Серверы для крэка Neverlose:
- **WSS сервер** (WebSocket) - порт 30030
- **HTTP сервер** - порт 30031

## Как задеплоить

1. Положи `neverlose.dll` в папку `server/data/`
2. Запушь все файлы в GitHub
3. Railway автоматом задеплоит
4. Получишь URL: `https://your-app.railway.app`

## Структура

```
server/
├── data/
│   ├── neverlose.dll    ← Положи сюда DLL
│   ├── module.bin       ← Зашифрованный модуль (385KB)
│   └── key.bin          ← Ключ (80 байт)
├── http_server.py       ← HTTP API
└── wss_server.py        ← WebSocket сервер
```

## API Endpoints

### GET /api/config
Возвращает конфиг + адрес Railway хоста:
```json
{
  "status": "ok",
  "server_host": "your-app.railway.app",
  "wss_port": 443,
  "http_port": 443
}
```

### GET /download/neverlose.dll
Скачать DLL с сервера

### WSS wss://your-app.railway.app/
WebSocket сервер для GetSerial

## Использование

Лоадер:
1. Скачивает конфиг: `GET https://your-app.railway.app/api/config`
2. Скачивает DLL: `GET https://your-app.railway.app/download/neverlose.dll`
3. Патчит адрес `127.0.0.1` → `your-app.railway.app` внутри DLL
4. Инжектит DLL в CS:GO

DLL подключается к Railway хосту автоматически.

## Переменные окружения

Railway автоматом устанавливает:
- `PORT` - порт для сервера
- `RAILWAY_PUBLIC_DOMAIN` - домен приложения
- `RAILWAY_ENVIRONMENT` - окружение (production)

## Проверка

```bash
curl https://your-app.railway.app/api/config
```
