const webpack = require('webpack');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.config.js');

module.exports = webpackMerge(commonConfig, {
	plugins: [
		new DefinePlugin({
			"ENV": `"prod"`
		}),
		new webpack.optimize.UglifyJsPlugin({
			 beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true
      },
      comments: false
		})
	]
});