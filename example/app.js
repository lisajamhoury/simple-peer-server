const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
const SimplePeerServer = require('simple-peer-server');
const spServer = new SimplePeerServer(server, true);

server.listen(8081);

module.exports = app;
