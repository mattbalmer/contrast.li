const express = require('express');
const path = require('path');
const proxy = require('./proxy');
const Config = require('./config');

const routes = express.Router();

routes.get('/album/:id', process.env.NODE_ENV == 'local'
  ? require('./mock-albums')
  : proxy.to('https://api.imgur.com/3/album/:id', {
    headers: {
      Authorization: `Client-ID ${Config.CLIENT_ID}`
    }
  }));

routes.get('/image/:id',
  proxy.to('https://api.imgur.com/3/image/:id', {
    headers: {
      Authorization: `Client-ID ${Config.CLIENT_ID}`
    }
  }));

routes.get('/a/:ids', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

routes.use(express.static( path.join(__dirname, '../dist') ));

module.exports = routes;