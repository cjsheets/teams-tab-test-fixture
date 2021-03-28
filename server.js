const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

http
  .createServer(function (req, res) {
    const sanitizePath = path.normalize(url.parse(req.url).pathname);
    let pathname = path.join(__dirname, sanitizePath);

    if (!fs.existsSync(pathname)) {
      res.statusCode = 404;
      res.end();
      return;
    }

    if (fs.statSync(pathname).isDirectory()) {
      pathname += '/index.html';
    }

    fs.readFile(pathname, function (_, data) {
      const ext = path.parse(pathname).ext;
      res.setHeader('Content-type', ext === '.js' ? 'text/javascript' : 'text/html');
      res.end(data);
    });
  })
  .listen(5000, '0.0.0.0');
