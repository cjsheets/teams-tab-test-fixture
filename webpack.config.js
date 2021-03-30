require('dotenv').config();
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = ({ dist }) => {
  const entry = {
    index: path.join(__dirname, 'src/index.tsx'),
    ['app-context']: path.join(__dirname, 'src/app-context.js'),
  };

  try {
    const buildAuthShim = dist && fs.existsSync('src/authentication.ts');
    if (buildAuthShim) entry.authentication = path.join(__dirname, 'src/authentication.ts');
  } catch (err) {
    // Auth shim can also be provided at runtime
  }
  console.log(`Building: ${JSON.stringify(entry)}`);

  return {
    entry,
    output: {
      filename: '[name].js',
      path: path.join(__dirname, dist ? 'dist' : 'lib'),
    },
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
    plugins: [
      new DotenvPlugin(),
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
      </body>
    </html>
  `,
      }),
    ],
    devServer: {
      port: 5000,
    },
  };
};
