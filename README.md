# simple-peer-server

Simple-peer-server is a [signaling server](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling) for [simple-peer](https://github.com/feross/simple-peer). It must be used with [simple-peer-wrapper](https://github.com/lisajamhoury/simple-peer-wrapper) on the client/browser side.

# Why use simple-peer-server

WebRTC peer connections are an excellent tool for building synchronous drawing, dancing, text, or video applications.

[Simple-peer](https://github.com/feross/simple-peer) is an excellent library for creating webRTC peer connections, however, it does not include a signaling server, which is necessary for establishing the peer connections used by simple-peer.

# How simple-peer-server works

Simple-peer-server provides a [signaling server](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling) that establishes a connection between two or more peers.

It uses [Socket.IO](https://socket.io/) to transport the signaling messages until the peer connections are created.

This package is a signaling server. It is not a STUN or TURN server! If you are launching your application on the public internet, you will likely need a STUN and TURN server as well. See the section below for more info on STUN/TURN.

# A note on STUN and TURN servers

Simple-peer-server and [simple-peer-wrapper](https://github.com/lisajamhoury/simple-peer-wrapper) together provide a [signaling server](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling) and client that establish a connection between two or more peers.

They use [Socket.IO](https://socket.io/) to transport the signaling messages, then create the peer connections via [simple-peer](https://github.com/feross/simple-peer).

If you are launching your application on the public internet, you will likely need STUN and TURN servers as well. About [86% of connections can be created with just STUN servers](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/), but the remaining connections require TURN servers.

Default STUN servers are provided by simple-peer. Although they can be overwritten (see [documentation](#new-simplepeerwrapperoptions) on this below). TURN servers can be expensive to maintain and need to be provided by the application developer (that's probably you if you're reading this ;).

To learn more about signaling, STUN, and TURN servers, I recommend [this article by Sam Dutton](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/). If you are in need of a TURN server, you may find this article on [How to set up and configure your own TURN server using Coturn](https://gabrieltanner.org/blog/turn-server) by Gabriel Turner helpful. You could also check out paid services like [Twilio's Network Traversal Service](https://www.twilio.com/stun-turn).

Once you have your TURN servers setup, see the documentation below for how to add them to your peer connections.

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

Simple-peer-server takes three arguments: a server, an option to debug, and an option to add simple-peer options (including STUN/TURN servers).

You must provide a server. The other parameters are optional.

```javascript
const http = require('http');
const SimplePeerServer = require('simple-peer-server');

const server = http.createServer();
const spServer = new SimplePeerServer(server, true); // second argument turns on console logging from server

server.listen(8081);
```

The options are as follows:

`server` is required.

`debug` is optional. It defaults to false. If true is passed, it turns on additional server logs from the signaling server.

`simplePeerOptions` is optional. It exposes the options available when creating a new WebRTC peer connection via simple-peer. See [simple-peer documentation](https://github.com/feross/simple-peer#peer--new-peeropts) for more info.

Note! This library sets the peer connections's `initiator` and `stream` options automatically. Overriding them by providing options from the server could break your application.

If you'd like to add your own STUN/TURN servers you can do so with as follows:

```javascript
const simplePeerOptions = {
  config: {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
      {
        urls: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808',
      },
      {
        urls: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808',
      },
    ],
  },
};

const server = http.createServer();
const spServer = new SimplePeerServer(
  server,
  true,
  simplePeerOptions,
);
```

Note that any simple-peer options provided by the server will override the default options in simple-peer AND any options provided via simple-peer-wrapper client.

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
