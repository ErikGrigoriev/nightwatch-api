const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { log } = require('../src/logger');
const { startWebDriver, stopWebDriver } = require('../src');

const mimeTypes = {
  html: 'text/html',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  js: 'text/javascript',
  css: 'text/css'
};

const server = http.createServer((req, res) => {
  let uri = url.parse(req.url).pathname;

  if (uri === '/') uri = '/test-app.html';

  const filename = path.join(__dirname, uri);
  fs.exists(filename, exists => {
    if (!exists) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write('404 Not Found\n');
      res.end();
      return;
    }
    const mimeType = mimeTypes[path.extname(filename).split('.')[1]];
    res.writeHead(200, { 'Content-Type': mimeType });

    const fileStream = fs.createReadStream(filename);
    fileStream.pipe(res);
  });
});

if (process.platform === 'win32') {
  var rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', function() {
    process.emit('SIGINT');
  });
}

(async function() {
  server.listen(3000);
  log('Test server started on port 3000');
  await startWebDriver();
})().catch(err => log(err));

process.on('SIGINT', async () => {
  try {
    server.close();
    log('Test server stoped on port 3000');
    await stopWebDriver();
    process.exit();
  } catch (err) {
    process.exit(1);
  }
});