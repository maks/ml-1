let finalhandler = require('finalhandler')
let fs = require('fs');
let https = require('https')
let serveIndex = require('serve-index')
let serveStatic = require('serve-static')

let port = process.argv[2];
let path = process.argv[3];

// pass in path as first param on command line,
// eg. node servedir.js 8003 /path/to/my/files
console.log(`serving: ${path} on http://localhost:${port}`);

// Serve directory indexes 
let index = serveIndex(path, { 'template': showDir })

// Serve up public/ftp folder files
let serve = serveStatic(path)

// SSL
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

// Create server
let server = https.createServer(options, function onRequest(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let done = finalhandler(req, res)
  serve(req, res, function onNext(err) {
    if (err) return done(err)

    index(req, res, done)
  })
})

server.listen(port)

// called for each request for a dir, returns dir file list as JSON
function showDir(locals, callback) {
  let fileList = [];
  locals.fileList.forEach(element => {
    const fileObj = {
      "name": element.name,
      "dir": element.stat.isDirectory()
    };
    fileList.push(fileObj);
  });
  callback(null, JSON.stringify(fileList));
}