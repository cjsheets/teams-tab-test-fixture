const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');
var request = require('request');

let serverContext = {
  // authScriptUrl or authScriptPath: '',
  // appContext: (see: ./src/hooks/use-session-context.ts),
  // teamsContext: Partial<microsoftTeams.Context>
};

const server = http.createServer(function (req, res) {
  const sanitizedPath = path.normalize(url.parse(req.url).pathname);
  let pathname = path.join(__dirname, sanitizedPath);

  if (sanitizedPath.endsWith('authentication.js')) {
    if (serverContext.authScriptUrl) {
      // Download and serve authentication script from remote source
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      const script = fs.createWriteStream('./authentication.js');

      const externalReq = request(serverContext.authScriptUrl);
      externalReq.on('data', function (chunk) {
        // Pipe stream as it's downloaded to response
        script.write(chunk);
        res.write(chunk);
      });
      externalReq.on('end', function () {
        res.end();
      });
      return;
    }
  }

  if (!fs.existsSync(pathname)) {
    res.statusCode = 404;
    res.end();
    return;
  }

  if (fs.statSync(pathname).isDirectory()) {
    pathname += '/index.html';
  }

  fs.readFile(pathname, 'utf-8', function (_, data) {
    let fileContent = data;

    if (pathname.endsWith('/index.html') && (serverContext.teamsContext || serverContext.appContext)) {
      fileContent = fileContent.replace(
        '/** ## AppContext **/',
        `window.TestFixtureAppContext = ${JSON.stringify(serverContext.appContext) || 'null'};`
      );

      fileContent = fileContent.replace(
        '/** ## TeamsContext **/',
        `window.TestFixtureTeamsContext = ${JSON.stringify(serverContext.teamsContext) || 'null'};`
      );
    }

    const ext = path.parse(pathname).ext;
    res.setHeader('Content-type', ext === '.js' ? 'text/javascript' : 'text/html');
    res.end(fileContent);
  });
});

module.exports = {
  server,
  startServer: function (context) {
    serverContext = context;
    server.listen(5000, '0.0.0.0').once('listening', () => console.log('TestFixture listening on port 5000'));
  },
  stopServer: function () {
    server.close(() => {
      console.log('TestFixture stopped');
      process.exit(0);
    });
  },
};
