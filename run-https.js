// var liveServer = require("live-server");

// var params = {
//   port: 8080, // Set the server port. Defaults to 8080.
//   root: ".", // Set root directory that's being served. Defaults to cwd.
//   open: false, // When false, it won't load your browser by default
//   file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
//   wait: 1000,
//   logLevel: 2,
// };
// liveServer.start(params);
const tls = require('tls')
const https = require('live-server-https');

const server = tls.createServer(https, (socket) => {
  console.log('server connected',
    socket.authorized ? 'authorized' : 'unauthorized');
  socket.write('welcome!\n');
  socket.setEncoding('utf8');
  socket.pipe(socket);
});
server.listen(8000, () => {
  console.log('server bound');
});