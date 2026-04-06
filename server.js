// Neverdildo Server for Railway
// Handles HTTP API requests and serves neverlose.dll

const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const app = express();

// Spoofed serial (from nl_crack/server/http_server.py)
const SPOOFED_SERIAL = "g6w/cgN2AuDsLw3xrzboM1kbkLy+osvg0Y/j0LJnQf04GHbV8s5V4yReEk1mh3ZA2G72fHG3oOh7zlGEfR1nKw717WiwRwsrgSDfJtaTQz14VDDkayLBNV1DaT/qSyx8Frg1nXU0crRu1P/G+EPvH6nWNPYLZdUMIeqVCToEFhJnqiuRoAyypjFNiKnLEMiy5j2YvBcLCOC8yC3FPt/GGsvUldBqkmQGkBjIsXsSkut05txVxq7VDx1i9adKE4zalTzNHr0Vtd6DTr8aeH8NYHWPGWAsnTBkZlkNuRuhBTtgRTcIKxzGATTN4k8/JaXCpxri7IqsylvZgXQw+5zldLjAHqcAWw3OD5iQn8DtOoon+DrHm3k3FY6wIrCM1FzTdjAIcTvXSiWOURHiwA4sJ8ExR4dyBZMydo8aBAYjrRxcD9oDa/VVJT4cZfDkyWvRjI3WMyEajF2JhiGcjpjztmD8fyt9C16VXwLfoYuJnrX1/Dv8SZfCU6U2UhwJlxO5mkg+/IctveCdxy8IIiXTKwA5vmiEpXRuUu17SCdmJhFLZ+Jr6cTmrob4exSEggGRk6BTaVomOq4I6IpkVUBIUVup+4JvWFseL5UkPOQqHIO5Rxnj1jY+PjAWFPeeXSZsP8/ceEnX8J13tfb7PAqRSrpQ1Wv/y+OjaqMoPg9PiRE=";

// Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('X-Powered-By', 'Express');
    res.header('Connection', 'keep-alive');
    res.header('Keep-Alive', 'timeout=5');
    
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Neverdildo server running',
        version: '1.0.0'
    });
});

// API: Config
app.get('/api/config', (req, res) => {
    console.log('  -> MakeRequest(/api/config)');
    res.json({
        status: 'ok',
        version: '2.0',
        update: false,
        config: {
            glow: true,
            esp: true,
            aimbot: true,
            misc: true
        }
    });
});

// API: Get Avatar
app.get('/api/getavatar', (req, res) => {
    const size = req.query.size || '100';
    const token = req.query.token;
    console.log(`  -> MakeRequest(/api/getavatar, size=${size}, token=${token})`);
    
    const avatarPath = path.join(__dirname, 'data', 'avatar.png');
    
    if (fs.existsSync(avatarPath)) {
        res.sendFile(avatarPath);
    } else {
        // Fallback: 1x1 transparent PNG
        const png = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
        );
        res.type('image/png').send(png);
    }
});

// API: Send Log
app.get('/api/sendlog', (req, res) => {
    const { token, a, build, cont, dump, cheat } = req.query;
    console.log(`  -> api/sendlog (token=${token}, a=${a}, build=${build}, cheat=${cheat})`);
    res.json({ status: 'ok' });
});

// API: Lua Library
app.get('/lua/:name', (req, res) => {
    const libname = req.params.name;
    const token = req.query.token;
    const cheat = req.query.cheat;
    const build = req.query.build;
    
    console.log(`  -> QueryLuaLibrary(${libname})`);
    
    const luaPath = path.join(__dirname, 'lua', `${libname}.lua`);
    
    if (fs.existsSync(luaPath)) {
        const content = fs.readFileSync(luaPath, 'utf8');
        console.log(`  -> Serving ${luaPath} (${content.length} bytes)`);
        res.type('text/plain').send(content);
    } else {
        // Return empty script
        res.type('text/plain').send(`-- lua library: ${libname}\n`);
    }
});

// Serve neverlose.dll
app.get('/neverlose.dll', (req, res) => {
    const dllPath = path.join(__dirname, 'Release', 'neverlose.dll');
    
    if (fs.existsSync(dllPath)) {
        console.log('  -> Serving neverlose.dll');
        res.sendFile(dllPath);
    } else {
        console.log('  -> neverlose.dll not found!');
        res.status(404).json({ error: 'DLL not found' });
    }
});

app.get('/Release/neverlose.dll', (req, res) => {
    const dllPath = path.join(__dirname, 'Release', 'neverlose.dll');
    
    if (fs.existsSync(dllPath)) {
        console.log('  -> Serving Release/neverlose.dll');
        res.sendFile(dllPath);
    } else {
        console.log('  -> Release/neverlose.dll not found!');
        res.status(404).json({ error: 'DLL not found' });
    }
});

// GetSerial fallback (POST)
app.post('*', (req, res) => {
    if (req.body && req.body.type === 4) {
        console.log('  -> GetSerial (type 4 auth request via HTTP)');
        res.type('text/plain').send(SPOOFED_SERIAL);
    } else {
        res.status(404).send(`Cannot POST ${req.path}`);
    }
});

// 404 handler (Express style)
app.use((req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot ${req.method} ${req.path}</pre>
</body>
</html>`;
    
    res.status(404)
        .header('Content-Security-Policy', "default-src 'none'")
        .header('X-Content-Type-Options', 'nosniff')
        .type('html')
        .send(html);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`===========================================`);
    console.log(`  Neverdildo Server`);
    console.log(`  Port: ${PORT}`);
    console.log(`  Serial: ${SPOOFED_SERIAL.substring(0, 40)}...`);
    console.log(`===========================================`);
    console.log(`\nDiscovered HTTP routes:`);
    console.log(`  GET /api/config`);
    console.log(`  GET /api/getavatar?size=100&token=<TOKEN>`);
    console.log(`  GET /api/sendlog?token=T&a=0&build=B&cont=C&dump=D&cheat=csgo`);
    console.log(`  GET /lua/<name>?token=T&cheat=csgo&build=B`);
    console.log(`  GET /neverlose.dll`);
    console.log(`\nWaiting for requests...\n`);
});
