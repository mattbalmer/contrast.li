const express = require('express');
const morgan = require('morgan');
const Config = require('./config');
const server = express();

server.use(morgan('dev'));
server.use(require('./router'));

module.exports = {
  start() {
    server.listen(Config.PORT, () => {
      console.log(`Server listening on port ${Config.PORT}`);
    });
  }
};
