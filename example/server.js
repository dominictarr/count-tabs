
var ecstatic = require('ecstatic')
var http = require('http')
var join = require('path').join

var PORT = 3000

http.createServer(
  ecstatic(join(__dirname, 'static'))
).listen(PORT, function () {
  console.log( 'listening on', PORT)
})
