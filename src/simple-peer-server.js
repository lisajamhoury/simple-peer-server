class SimplePeerServer {
  constructor(httpServer, debug, simplePeerOptions) {
    this.ioServer;
    this.rooms = [];
    this.roomCounter = 0;

    this.debug = false;
    if (typeof debug !== 'undefined') {
      this.debug = true;
    }

    this.simplePeerOptions;
    if (typeof simplePeerOptions !== 'undefined') {
      console.log('setting options');
      this.simplePeerOptions = simplePeerOptions;
    }

    this.init(httpServer);
  }

  init(httpServer) {
    this.ioServer = require('socket.io')(httpServer, {
      cors: {
        origin: '*',
      },
    });

    this.ioServer.sockets.on('connection', (socket) => {
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
        this._handleCreateOrJoin(socket, this.ioServer),
      );
      socket.on('hangup', () => this._handleHangup(socket));
      socket.on('disconnect', (reason) =>
        this._handleDisconnect(reason),
      );

      if (typeof this.simplePeerOptions !== 'undefined') {
        socket.emit('simple peer options', this.simplePeerOptions);
      }
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
    const clientIds = Array.from(
      this.ioServer.sockets.sockets.keys(),
    );
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
      this.ioServer.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      this.ioServer.sockets.in(room).emit('ready'); // not being used anywhere

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

          this.ioServer.sockets.sockets.get(clientIds[i]).join(room);
          this.ioServer.sockets.sockets
            .get(clientIds[i])
            .emit('joined', room, clientIds[i]);
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

  _handleHangup() {
    this.debug && console.log('received hangup');
  }

  _handleDisconnect(reason) {
    this.debug && console.log('disconnecting bc ' + reason);
  }
}

module.exports = SimplePeerServer;
