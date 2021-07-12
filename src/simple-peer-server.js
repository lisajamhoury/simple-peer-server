class SimplePeerServer {
  constructor(httpServer, debug) {
    this.rooms = [];
    this.roomCounter = 0;

    this.debug = false;
    if (typeof debug !== 'undefined') {
      this.debug = true;
    }

    this.init(httpServer);
  }

  init(httpServer) {
    const ioServer = require('socket.io')(httpServer);
    ioServer.sockets.on('connection', (socket) => {
      // logs server messages on the client
      socket.on('message', (message) =>
        this._handleMessage(message, socket),
      );
      socket.on('initiate peer', (room) =>
        this._handleInitiatePeer(room, socket),
      );
      socket.on('sending signal', (message) =>
        this._handleSendSignal(message, socket),
      );
      socket.on('create or join', () =>
        this._handleCreateOrJoin(socket, ioServer),
      );
      socket.on('ipaddr', () => this._handleIpAddress(socket));
      socket.on('hangup', () => this._handleHangup(socket));
      socket.on('disconnect', (reason) =>
        this._handleDisconnect(reason),
      );
    });
  }

  _handleMessage(message, socket) {
    this.debug && console.log('Client said: ', message);
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  }

  _handleInitiatePeer(room, socket) {
    this.debug &&
      console.log('Server initiating peer in room ' + room);
    socket.to(room).emit('initiate peer', room);
  }
  _handleSendSignal(message, socket) {
    this.debug &&
      console.log('Handling send signal to room ' + message.room);
    socket.to(message.room).emit('sending signal', message);
  }

  _handleCreateOrJoin(socket, ioServer) {
    const clientIds = Object.keys(ioServer.sockets.sockets);
    const numClients = clientIds.length;
    this.debug && console.log('NUMCLIENTS, ' + numClients);

    if (numClients === 1) {
      const room = this._createRoom();
      socket.join(room);
      socket.emit('created', room, socket.id);

      this.debug &&
        console.log(
          'Client ID ' + socket.id + ' created room ' + room,
        );
    } else if (numClients === 2) {
      const room = this.rooms[0];
      ioServer.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      ioServer.sockets.in(room).emit('ready'); // not being used anywhere

      this.debug &&
        console.log(
          'Client ID ' + socket.id + ' joined room ' + room,
        );
    } else if (numClients > 2) {
      for (let i = 0; i < numClients; i++) {
        if (socket.id !== clientIds[i]) {
          // create a room and join it
          const room = this._createRoom();
          socket.join(room);
          this.debug &&
            console.log(
              'Client ID ' + socket.id + ' created room ' + room,
            );
          socket.emit('created', room, socket.id);
          socket.emit('join', room);

          //
          this.debug &&
            console.log(
              'Client ID ' + clientIds[i] + ' joined room ' + room,
            );

          ioServer.sockets.sockets[clientIds[i]].join(room);
          ioServer.sockets.sockets[clientIds[i]].emit(
            'joined',
            room,
            clientIds[i],
          );
        }
      }
    }
  }

  _createRoom() {
    const room = 'room' + this.roomCounter;
    this.rooms.push(room);
    this.debug && console.log('number of rooms ' + this.rooms.length);
    this.roomCounter++;
    return room;
  }

  _handleIpAddress = (socket) => {
    let ifaces = os.networkInterfaces();
    for (let dev in ifaces) {
      ifaces[dev].forEach(function (details) {
        if (
          details.family === 'IPv4' &&
          details.address !== '127.0.0.1'
        ) {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  };

  _handleHangup() {
    this.debug && console.log('received hangup');
  }

  _handleDisconnect(reason) {
    this.debug && console.log('disconnecting bc ' + reason);
  }
}

module.exports = SimplePeerServer;
