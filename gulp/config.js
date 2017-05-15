const path = require('path');
const fs = require('fs');
let bundles = (srcPath) => fs.readdirSync(path.resolve(__dirname, srcPath)).filter(name => name.indexOf('.bundle') > -1).map(name => name.replace(/\.bundle.*$/g, ''));

const EnvConfig = {
  SENTRY: {
    local: 'https://e0bb370b212a4f248a0726bb27695a8c@sentry.io/168107',
    staging: 'https://9402f9b7238a45899b5aa876d63e856b@sentry.io/168108',
    production: 'https://29db574cdea94e648c798e8e3a466e3f@sentry.io/168109'
  },
  GA: {
    local: 'UA-99148586-1',
    staging: 'UA-99148586-2',
    production: 'UA-99148586-3'
  }
};

module.exports = function(TARGET_ENV) {
  const pkg = require('../package.json');

  return {
    NODE_MODULES: [],
    GA: EnvConfig.GA[TARGET_ENV],
    SENTRY: EnvConfig.SENTRY[TARGET_ENV],
    ENV: TARGET_ENV,
    VERSION: pkg.version,
    PORT: process.env.PORT || 3000,
    CSS_BUNDLES: bundles('../client/js'),
    JS_BUNDLES: bundles('../client/css'),
    EXT: {
      JS: 'ts'
    }
  };
};