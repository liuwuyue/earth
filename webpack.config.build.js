var webpack = require('atool-build/lib/webpack');

module.exports = function(webpackConfig) {
  webpackConfig.output.publicPath = '/dist/';
  // 添加一个plugin
  webpackConfig.babel.plugins.push('transform-runtime');
  return webpackConfig;
};

