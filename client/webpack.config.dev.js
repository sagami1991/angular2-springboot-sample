
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.config.js');

//TODO グローバル変数にDEV追加
module.exports = webpackMerge(commonConfig, {
	devtool: 'cheap-module-eval-source-map',
	devServer: {
		port: 3001,
		contentBase: "src/"
	}
});