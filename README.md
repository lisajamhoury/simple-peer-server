# simple-peer-server

Simple-peer-server is a [signaling server](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling) for [simple-peer](https://github.com/feross/simple-peer). It must be used with [simple-peer-wrapper](https://github.com/lisajamhoury/simple-peer-wrapper) on the client/browser side.

# Why use simple-peer-server

WebRTC peer connections are an excellent tool for building synchronous drawing, dancing, text, or video applications.

[Simple-peer](https://github.com/feross/simple-peer) is an excellent library for creating webRTC peer connections, however, it does not include a signaling server, which is necessary for establishing the peer connections used by simple-peer.

# How simple-peer-server works

Simple-peer-server provides a [signaling server](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling) that establishes a connection between two or more peers.

It uses [Socket.IO](https://socket.io/) to transport the signaling messages until the peer connections are created.

This package is a signaling server. It is not a STUN or TURN server! If you are launching your application on the public internet, you will likely need a STUN and TURN server as well. See the [simple-peer-wrapper](https://github.com/lisajamhoury/simple-peer-wrapper) documentation for more info on STUN/TURN. To learn more about signaling, STUN, and TURN servers, I recommend [this article by Sam Dutton](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/).

# Usage

You must have [node and npm](https://nodejs.org/en/download/) installed to use this module. (If this is new to you, you might want to watch [this explanation of node](https://www.youtube.com/watch?v=FjWbUK2HdCo&t=0s) before continuing.)

Install the package using npm or your favorite package manager.

```bash
# in your terminal

npm install simple-peer-server
```

Require the module in your server code.

```javascript
// in app.js

const SimplePeerServer = require('simple-peer-server');
```

Pass an http server into the signalling server. This will be used by the socket.io server.

```javascript
// in app.js

const http = require('http');
const server = http.createServer();
const spServer = new SimplePeerServer(server);
```

Choose a port for your server to listen on.

```javascript
// in app.js

server.listen(8081);
```

Run the server.

```bash
# in your terminal

node app.js
```

## Options

Simple-peer-server takes two arguments: an server and an option to debug. The server is required. The debug argument is optional. It defaults to false. If true is passed, it turns on additional server logs from the signaling server.

```javascript
const spServer = new SimplePeerServer(server, true); // true turns on logging
```

# Running the example code

To run the example, navigate into the example folder using your terminal, then run `npm install`.

```bash
# in your terminal

cd simple-peer-server/example
npm install
```

Run the server.

```bash
# in your terminal

npm start
```

This will run a signaling sever on port 8081. If you are running this on your desktop, it will run on localhost by default at http://localhost:8081

## Optional: Run example code with nodemon

The example comes with the [nodemon](https://www.npmjs.com/package/nodemon) module installed. Nodemon will automatically restart your server every time you make a change to the app.js file. If you'd like to run with nodemon start the server like this _instead_ of running `npm start`:

```bash
# in your terminal

npm run watch
```
