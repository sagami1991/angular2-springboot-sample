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
		root:["./src"]
  },
	module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader'
      },
			{ test: /\.html$/, loader: 'raw'},
			{ test: /\.scss$/, loaders: ["raw","sass"] },
			{ test: /\.png$/, loader: "url" },
			//bootstrap用
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
        loader: 'url?limit=10000&mimetype=image/svg+xml'
      }
    ]
  },
	node: {
    global: 'window',
    crypto: 'empty',
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
};
