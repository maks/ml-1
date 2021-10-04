let finalhandler = require('finalhandler')
let http = require('http')
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

// Create server
let server = http.createServer(function onRequest(req, res) {
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