
/**
 * 以下のコピペ
 * https://github.com/AngularClass/angular2-webpack-starter/blob/master/config/webpack.prod.js
 */
const webpack = require('webpack');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const webpackMerge = require('webpack-merge');
const DedupePlugin = require('webpack/lib/optimize/DedupePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

const commonConfig = require('./webpack.config.js');
const env = {
	host: 'ec2-52-197-46-233.ap-northeast-1.compute.amazonaws.com',
	port: 3001
};

module.exports = webpackMerge(commonConfig, {
	output: {
		publicPath: `http://${env.host}:${env.port}/`
	},
	plugins: [
		new DedupePlugin(),
		new DefinePlugin({
			ENV: `"prod"`,
			PABLICPATH: `"http://${env.host}:${env.port}/"`
		}),
		new UglifyJsPlugin({
      beautify: false, //prod
      mangle: { screw_ie8 : true }, //prod
      compress: { screw_ie8: true }, //prod
      comments: false //prod
		})
	]
});