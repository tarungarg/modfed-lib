const  ModuleFederationPlugin  = require("webpack/lib/container/ModuleFederationPlugin");
const path = require('path');
const isProduction = process.env.NODE_ENV == 'production';
const webpack = require('webpack');

const optimization = {
  mergeDuplicateChunks: true,
  removeAvailableModules: true,
  emitOnErrors: true,
  minimizer: [],
  splitChunks: {
    // https://medium.com/dailyjs/webpack-4-splitchunks-plugin-d9fbbe091fd0
    cacheGroups: {
      defaultVendors: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        // We don't care about the lazy load modules (async)
        chunks: 'all',
        minChunks: 2,
        priority: 3,
      },
      // https://webpack.js.org/plugins/split-chunks-plugin/#split-chunks-example-1
      commons: {
        test: /[\\/]src[\\/]/,
        name: 'commons',
        // We don't care about the lazy load modules (async)
        chunks: 'all',
        minChunks: 3, // if 3 chunks import something, put it in common
        priority: 2,
      }
    }
  }
};

// Remove `console.log` statements in the release version
if (isProduction) {
  optimization.minimizer.push(
    // new TerserPlugin({
    //   terserOptions: {
    //     sourceMap: true,
    //     compress: {
    //       drop_console: true,
    //     }
    //   }
    // })
  );

  // Minify CSS files
  // https://github.com/webpack-contrib/css-minimizer-webpack-plugin
  // optimization.minimizer.push(new CssMinimizerPlugin());
}

module.exports = {
  entry: './index.js',
  mode: isProduction ? 'production' : 'development',
  devtool: 'hidden-source-map',
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    publicPath: 'auto',
    clean: true,
  },
  optimization,
  plugins: [
    new webpack.ProgressPlugin({
      // percentBy: 'entries'
    }),
    new ModuleFederationPlugin({
      name: 'lib',
      filename: 'remoteEntry.js',
      exposes: {
        './react': 'react',
        './react-dom': 'react-dom',
      },
    }),
  ],
};
