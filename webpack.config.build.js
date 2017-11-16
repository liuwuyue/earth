var webpack = require('atool-build/lib/webpack');
let packageJson = require('./package.json');
let version = packageJson.version; 
module.exports = function(webpackConfig) {
  webpackConfig.output.publicPath = '/dist/' + version + '/';
  // 添加一个plugin
  webpackConfig.babel.plugins.push('transform-runtime');
  return webpackConfig;
};

