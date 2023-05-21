const fs = require('fs');
const https = require('https');
const path = require('path');
const url = require('url');
var request = require('request');

// Set when startServer is called or here for development
let serverContext = {
  // authScriptUrl or authScriptPath: '',
  // appContext: (see: ./src/hooks/use-session-context.ts),
  // teamsContext: Partial<microsoftTeams.Context>
};

const { key, cert } = generateKey();
const options = { key, cert, requestCert: false, rejectUnauthorized: false };

const server = https.createServer(options, function (req, res) {
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
    } else {
      // Serve authentication script from local filesystem
      const filePath = path.join(process.cwd(), 'authentication.js')
      const file = fs.readFileSync(filePath)
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.write(file);
      res.end();
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

function generateKey() {
  const { pki, md } = require('node-forge');

  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();

  cert.publicKey = keys.publicKey;
  cert.serialNumber = '12';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const certificateFields = [
    { name: 'commonName', value: 'mock' },
    { name: 'countryName', value: 'mock' },
    { shortName: 'ST', value: 'mock' },
    { name: 'localityName', value: 'mock' },
    { name: 'organizationName', value: 'mock' },
    { shortName: 'OU', value: 'mock' },
  ];

  cert.setSubject(certificateFields);
  cert.setIssuer(certificateFields);
  cert.sign(keys.privateKey, md.sha1.create());

  return { key: pki.privateKeyToPem(keys.privateKey), cert: pki.certificateToPem(cert) };
}

module.exports = {
  server,
  startServer: function (context) {
    serverContext = context;
    server.listen(8080, '0.0.0.0').once('listening', () => console.log('TestFixture listening on port 8080'));
  },
  stopServer: function () {
    server.close(() => {
      console.log('TestFixture stopped');
      process.exit(0);
    });
  },
};
