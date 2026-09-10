const HtmlWebpackPlugin = require('html-webpack-plugin');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const DotenvPlugin = require('dotenv-webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

require('dotenv').config({
  path: './.env',
});

const { DEV_PORT } = process.env;

const config = {
  DEV_PORT,
};

const { ModuleFederationPlugin } = webpack.container;

module.exports = (env, argv) => ({
  // mode: "development",
  // Class names are needed for integration testing of the production build
  // `testcafe-react-selector` needs these classnames to be present
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
          sourceMap: true,
        },
      }),
    ],
  },
  entry: './src/index',
  devtool: argv.mode === 'production' ? 'source-map' : 'eval-cheap-module-source-map',
  devServer: {
    allowedHosts: 'all',
    // Enable gzip compression of generated files.
    compress: false,
    // Silence the dev server's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    client: {
      logging: 'none',
    },
    // Enable hot reloading server. Note that only changes to CSS are currently
    // hot reloaded. JS changes will refresh the browser.
    hot: true,
    historyApiFallback: true, // React Router
    // Serve, and reload on, anything already built into dist.
    static: {
      directory: path.join(__dirname, 'dist'),
      publicPath: '/',
      watch: true,
    },
    port: config.DEV_PORT,
    host: '0.0.0.0',
    proxy: [
      {
        // For local testing update `target` to point to your
        // locally hosted or port-forwarded `central-settlements` service
        context: ['/central-settlements'],
        target: 'http://localhost:3007',
        pathRewrite: { '^/central-settlements': '/v2' },
        secure: false,
      },
      {
        // For local testing update `target` to point to your
        // locally hosted or port-forwarded `central-ledger` service
        context: ['/central-ledger'],
        target: 'http://localhost:3001',
        pathRewrite: { '^/central-ledger': '' },
        secure: false,
      },
      {
        // For local testing update `target` to point to your
        // locally hosted or port-forwarded `reporting` service
        context: ['/template-api'],
        target: 'http://localhost:42531',
        pathRewrite: { '^/template-api': '' },
        secure: false,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    // It automatically determines the public path from either
    // `import.meta.url`, `document.currentScript`, `<script />`
    // or `self.location`.
    publicPath: 'auto',
    // Hash files for cache busting
    filename: '[name].[contenthash].js',
    assetModuleFilename: "images/[hash][ext][query]",
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules', 'react'),
      'react-redux': path.resolve(__dirname, 'node_modules', 'react-redux'),
    },
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve("vm-browserify")
  },
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                require.resolve('@babel/plugin-proposal-class-properties'),
                require.resolve('@babel/plugin-proposal-object-rest-spread'),
                require.resolve('babel-plugin-syntax-async-functions'),
                require.resolve('@babel/plugin-transform-runtime'),

              ].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.(s)?css$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // SCSS
          'sass-loader',
        ],
      },
      {
        test: /\.svg$/,
        loader: '@svgr/webpack',
        options: {
          svgoConfig: {
            plugins: [{ removeViewBox: false }],
          },
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public/runtime-env.js', to: 'runtime-env.js' }],
    }),
    new EslintWebpackPlugin({
      extensions: ['ts', 'js', 'tsx', 'jsx'],
      exclude: [`node_modules`],
    }),
    new DotenvPlugin({
      systemvars: true,
    }),
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        files: './src/**/*.{ts,tsx,js,jsx}',
      },
    }),
    new ModuleFederationPlugin({
      name: 'reporting_hub_bop_settlements_ui',
      library: { type: 'var', name: 'reporting_hub_bop_settlements_ui' },
      filename: 'app.js',
      exposes: {
        './App': './src/Injector',
        './Menu': './src/Menu',
      },
      shared: [
        'react',
        'react-dom',
        'react-redux',
        'react-router-dom',
        'redux',
        'redux-saga',
        'history',
        '@reduxjs/toolkit',
        '@modusbox/react-components',
      ],
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    // fix "process is not defined" error:
    new webpack.ProvidePlugin({
      // Make a global `process` variable that points to the `process` package,
      // because the `util` package expects there to be a global variable named `process`.
      // Thanks to https://stackoverflow.com/a/65018686/14239942
      process: 'process/browser'
   }),
  ].filter(Boolean),
});
