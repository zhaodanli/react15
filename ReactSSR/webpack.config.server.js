const path = require('path');
const { merge } = require('webpack-merge');
// 不需要打包核心模块，作为外部依赖
const webpackNodeExternals = require('webpack-node-externals');
const base = require('./webpack.config.base');

module.exports = merge(base, {
    target: 'node',
    entry: './src/server/index.js',
    output: {
        path: path.resolve('build'),
        filename: 'server.js'
    },
    externals: [webpackNodeExternals()]
});