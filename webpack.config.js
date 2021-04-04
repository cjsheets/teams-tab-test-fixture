require('dotenv').config();
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = ({ auth, dist }) => {
  const webpackConfig = {
    entry: {
      index: path.join(__dirname, 'src/index.tsx'),
    },
    output: {
      filename: '[name].js',
      path: path.join(__dirname, auth || dist ? 'dist' : 'lib'),
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [{ from: 'server.js' }],
      }),
      new HtmlWebpackPlugin({
        templateContent: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Teams Tab Test Fixture</title>
        <style>
          @keyframes loading-spinner { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @-webkit-keyframes loading-spinner { 0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); } }
        </style>
      </head>
      <body style="margin: 0; font-family: 'Segoe UI'">
        <div id="root"></div>
        <script>
          /** ## AppContext **/
          /** ## TeamsContext **/
        </script>
      </body>
    </html>
  `,
      }),
    ],
  };

  if (auth) {
    webpackConfig.entry = {
      authentication: path.join(__dirname, 'src/authentication.ts'),
    };
    webpackConfig.output.library = { type: 'umd', name: 'TeamsTabTestFixture' };
    webpackConfig.plugins = [];
  }

  return {
    ...webpackConfig,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [new DotenvPlugin(), ...webpackConfig.plugins],
    devServer: {
      port: 5000,
    },
  };
};
