const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

let initialParams = {};

const server = http.createServer(function (req, res) {
  const sanitizedPath = path.normalize(url.parse(req.url).pathname);
  let pathname = path.join(__dirname, sanitizedPath);

  if (sanitizedPath === '/authentication.js') {
    // return custom authentication
  }

  if (sanitizedPath === '/app-context.js') {
    // return context
  }

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
});

module.exports = {
  server,
  startServer: function (param) {
    initialParams = param;
    server.listen(5000, '0.0.0.0').once('listening', () => console.log('TestFixture listening on port 5000'));
  },
  stopServer: function () {
    server.close(() => {
      console.log('TestFixture stopped');
      process.exit(0);
    });
  },
};
