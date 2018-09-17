const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const logger = require('morgan');
const database = require('./db');

// initialize the database
database.initialize();

console.log("Starting application...");
// start up the app
const app = express();

// protect the app, put on a helmet
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

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
    res.header('Access-Control-Allow-Origin', 'https://zbt.mit.edu');
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
    res.header('Access-Control-Allow-Origin', 'https://zbt.mit.edu');
  } else {
    // IN DEV
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000' /* or wherever your frontend is */)
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// routes
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
const zebes = require('./routes/zebes');
const homes = require('./routes/home');
const midnights = require('./routes/midnights/index');
const semesters = require('./routes/semester');
const trades = require('./routes/trades');

app.use('/api/home', homes);
app.use('/api/zebes', zebes);
app.use("/api/midnights", midnights);
app.use("/api/semester", semesters);
app.use("/api/trades", trades);

module.exports = app;
