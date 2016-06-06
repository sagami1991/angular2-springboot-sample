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
			{ test: /\.png$/, loader: "url" }
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
