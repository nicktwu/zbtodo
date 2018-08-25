const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const logger = require('morgan');
const crypto = require('crypto');
const database = require('./db');
const session_secret = crypto.randomBytes(256).toString('hex');

// initialize the database
database.initialize();

// setup basic session stuff
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const sessionOptions = {
  name: "zbtodo-session",
  secret: session_secret,
  resave: false,
  saveUninitialized: false,
  httpOnly: false
};

if (process.env.HEROKU) {
  // Production mode: should not save session information in local memory, connect to a redis store
  sessionOptions.store = new RedisStore({
    url: process.env.REDIS_URL
  });
}

console.log("Starting application...");
// start up the app
const app = express();

// protect the app, put on a helmet
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// setup sessions
app.use(session(sessionOptions));

if (process.env.HEROKU) {
  // PROD: minimal logging
  app.use(logger('tiny'))
} else {
  app.use(logger('combined'))
}

// handle the options requests
app.options("/*", function(req, res) {
  if (process.env.HEROKU) {
    // IN PROD
    res.header('Access-Control-Allow-Origin', '*.mit.edu');
  } else {
    // IN DEV
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000' /* or wherever your frontend is */)
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Origin, Content-Length, X-Requested-With');
  res.sendStatus(200);
});

// allow origins
app.use(function(req, res, next) {
  if (process.env.HEROKU) {
    // IN PROD
    res.header('Access-Control-Allow-Origin', '*.mit.edu');
  } else {
    // IN DEV
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000' /* or wherever your frontend is */)
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// routes
const zebes = require('./routes/zebes');
const homes = require('./routes/home');
const auth = require('./auth');

app.use('/auth', auth.routes);

if (!process.env.HEROKU) {
  // not in production, enable the dev routes
  const dev = require('./dev');
  app.use('/dev', dev)
}

// everything here on down needs to be authenticated with a token
app.use(auth.requireAuthentication);
app.use(auth.withRefresh);

// api routes
app.use('/api/home', homes);
app.use('/api/zebes', zebes);


module.exports = app;
