const Config = {
  ENV: process.env.NODE_ENV || 'local',
  PORT: process.env.PORT || 3000,
  CLIENT_ID: process.env.CLIENT_ID
};

module.exports = Config;