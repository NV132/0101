const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    entry: './assets/js/app.js',
    output: {
      filename: 'js/bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    module: {
      rules: [
        { 
          test: /\.js$/, 
          exclude: /node_modules/, 
          use: 'babel-loader' 
        },
        { 
          test: /\.scss$/, 
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader', 
            'sass-loader'
          ] 
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html'
      }),
      new HtmlWebpackPlugin({
        template: './public/products.html',
        filename: 'products.html'
      }),
      new HtmlWebpackPlugin({
        template: './public/consultation.html',
        filename: 'consultation.html'
      }),
      new HtmlWebpackPlugin({
        template: './public/faq.html',
        filename: 'faq.html'
      }),
      new MiniCssExtractPlugin({
        filename: 'css/[name].css'
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'assets/images', to: 'images' },
          { from: 'assets/fonts', to: 'fonts' },
          { from: 'assets/js/data', to: 'js/data' }
        ]
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      port: 8080,
      hot: true
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  };
}; 