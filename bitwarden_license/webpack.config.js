const webpackConfig = require('../webpack.config');

webpackConfig.entry['app/main'] = './bitwarden_license/src/app/main.ts';

module.exports = webpackConfig;
