var webpack = require('atool-build/lib/webpack');

module.exports = function(webpackConfig) {
  webpackConfig.output.publicPath = '/assets/earth/dist/';
  // 添加一个plugin
  webpackConfig.babel.plugins.push('transform-runtime');
  // 返回 webpack 配置对象
  return webpackConfig;
};

