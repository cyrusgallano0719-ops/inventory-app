const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const childProcess = require('child_process');

const FRONTEND_PORT = 3000;
const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;
const ROOT_DIR = process.pkg
  ? path.dirname(process.execPath)
  : path.resolve(__dirname);

function openBrowser(targetUrl) {
  const platform = process.platform;
  let command;

  if (platform === 'win32') {
    command = `start "" "${targetUrl}"`;
  } else if (platform === 'darwin') {
    command = `open "${targetUrl}"`;
  } else {
    command = `xdg-open "${targetUrl}"`;
  }

  childProcess.exec(command, (error) => {
    if (error) {
      console.error('Unable to open browser automatically:', error);
    }
  });
}

function getMimeType(filePath) {
  const extensions = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.ico': 'image/x-icon',
  };
  return extensions[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function serveStaticFile(req, res) {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname || '/');

  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const filePath = path.join(ROOT_DIR, pathname);
  if (!filePath.startsWith(ROOT_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const fallbackPath = path.join(ROOT_DIR, 'index.html');
      fs.readFile(fallbackPath, 'utf8', (fallbackErr, fallbackData) => {
        if (fallbackErr) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }

        res.setHeader('Content-Type', 'text/html');
        res.end(fallbackData);
      });
      return;
    }

    const stream = fs.createReadStream(filePath);
    res.setHeader('Content-Type', getMimeType(filePath));
    stream.pipe(res);
    stream.on('error', () => {
      res.statusCode = 500;
      res.end('Internal Server Error');
    });
  });
}

async function startFrontend() {
  return new Promise((resolve) => {
    const server = http.createServer(serveStaticFile);
    server.listen(FRONTEND_PORT, () => {
      console.log(`Frontend server running on ${FRONTEND_URL}`);
      resolve(server);
    });
  });
}

function startBackend() {
  console.log('Starting backend server...');
  require('./backend/server.js');
}

async function main() {
  startBackend();
  await startFrontend();
  openBrowser(FRONTEND_URL);

  process.on('SIGINT', () => {
    console.log('\nShutdown requested. Closing launcher.');
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Launcher failed:', err);
  process.exit(1);
});
