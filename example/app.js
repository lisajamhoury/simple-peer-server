const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const livereload = require('livereload');
const connectLiveReload = require('connect-livereload');
const http = require('http');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

const server = http.createServer(app);
const SimplePeerServer = require('simple-peer-server');

const spServer = new SimplePeerServer(server, true);

server.listen(8081);

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

// for automatic browser reload
app.use(connectLiveReload());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//
app.use(logger('dev'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  }),
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// for automatic server reload
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

module.exports = app;
