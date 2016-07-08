/// <reference path="typings/globals/webpack/index.d.ts" />

const CopyWebpackPlugin = require('copy-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const dateFormat = require('dateformat');

module.exports = {
	entry: {
		"main": "./src/main.ts"
	},
	output: {
    path:"./dist",
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js'
  },
	resolve: {
		extensions: ['', '.ts','.js'],
		root:["./src"],
		modulesDirectories: ['node_modules']
  },
	module: {
		  preLoaders: [
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [
          './node_modules/rxjs',
          './node_modules/@angular'
        ]
      }
    ],
    loaders: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader'
      },
			{ test: /\.html$/, loader: 'raw'},
			{ test: /\.scss$/, loaders: ["raw","sass"] },
			{ test: /\.png$/, loader: "url?limit=10000&mimetype=image/png" },
			//bootstrapのフォント用
			{
        test: /\.(woff|woff2)$/,
        loader: 'url?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf$/,
        loader: 'url?limit=10000&mimetype=application/octet-stream'
      },
      {test: /\.eot$/, loader: 'file'},
      {
        test: /\.svg$/,
        loader: 'url?limit=1000&mimetype=image/svg+xml'
      }
    ]
  },
	plugins: [
		new CopyWebpackPlugin([
			//angular読み込み前に必要なもの
			{ from: 'src/init', to: 'init' },
			//絵文字画像コピー
			{ from: 'node_modules/emojione/assets/svg', to: 'emojione/assets/svg' },
		]),
		new DefinePlugin({
			VERSION: `"${dateFormat(new Date(),"yyyy/mm/dd HH:MM")}"`
		}),
	],
	node: {
		global: 'window',
		crypto: 'empty',
		module: false,
		clearImmediate: false,
		setImmediate: false
  }
};
