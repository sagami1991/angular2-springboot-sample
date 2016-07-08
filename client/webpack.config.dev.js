/// <reference path="typings/globals/webpack/index.d.ts" />

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.config.js');

const env = {
	host: '192.168.1.3',
	port: 3001
};

module.exports = webpackMerge(commonConfig, {
	devtool: 'cheap-module-eval-source-map',
	output: {
		publicPath: `http://${env.host}:${env.port}/`
	},
	debug: true,
	plugins: [
		new webpack.DefinePlugin({
			ENV: `"dev"`,
			PABLICPATH: `"http://${env.host}:${env.port}/"`
		}),
	],
	devServer: {
		port: env.port,
		contentBase: "src/",
		host: env.host
	}
});