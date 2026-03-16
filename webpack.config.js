/* jshint esversion: 6 */
const CopyPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SourceMapDevToolPlugin = require('webpack/lib/SourceMapDevToolPlugin');
const TerserPlugin = require('terser-webpack-plugin');
const UnusedWebpackPlugin = require('unused-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { execSync } = require('child_process');
const { DateTime } = require('luxon');

const port = process.env.PORT || 4000;
const isHTTPS = process.env.PROTOCOL && process.env.PROTOCOL === 'HTTPS';
const isWebApp = !process.env.npm_lifecycle_script.includes('CORDOVA=1');
const useRealCerts = process.env.npm_lifecycle_script.includes('USE_REAL_CERTS=1');
// const isProduction = process.env.npm_lifecycle_script.includes('PRODUCTION=1');
const source = isWebApp ? 'src' : 'srcCordova';
const bundleAnalysis = process.env.ANALYSIS || false;  // enable the interactive bundle analyser and the Unused component analyzer
const minimized = process.env.MINIMIZED === '1' || false;  // enable the Terser plugin that strips comments and shrinks long variable names
const verBits = process.version.split('.');
const major = parseInt(verBits[0].replace('v', ''));
if (major < 22) {
  console.error(`The minimum Node version is: v22.0.0, but you are running ${process.version}\n`);
} else {
  console.log(`Node version is: ${process.version}`);
}
if (useRealCerts) console.log('useRealCerts in webpack.config.js ', useRealCerts);
// console.log('key: ', fs.readFileSync(`./${source}/cert/wevotedeveloper.com.crt`).toString());

async function getStatusValues () {
  const stats = {};
  try {
    stats.nodeVersion = execSync('node --version').toString().trim();
    stats.npmVersion = execSync('npm --version').toString().trim();
  } catch (error) {
    console.log('ERROR in getGitValues node/npm: ', error);
  }
  try {
    let hash = fs.readFileSync('./git_commit_hash', 'utf8');
    hash = hash.trim();
    const hashURL = `https://github.com/wevote/weconnect-server/commit/${hash}`;
    const response = await fetch(hashURL);
    const text = await response.text();
    console.log(`git_commit_hash: '${text}'`);
    const pr = text.match(/"Merge pull request (.*?)wevote/);
    stats.Pull_request = pr[1].slice(0, -2);
    const dateStringResults = text.match(/"committedDate":"(.*?)"/);
    console.log(dateStringResults[1]);
    const date = new DateTime(dateStringResults[1]);
    stats.Git_committed_date = date.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
    stats.Git_commit_hash = `<a href="${hashURL}">${hash}</a>`;
  } catch (error) {
    console.log('Error in getStatusValues git: ', error);
  }

  return stats;
}

module.exports = async (env, argv) => {
  const stats = await getStatusValues();
  console.log('getStatusValues', JSON.stringify(stats));
  return {
    entry: path.resolve(__dirname, `./${source}/index.jsx`),
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules|srcDeprecated/,
          use: ['babel-loader'],
        },
        {
          test: /\.(png|jp(e*)g|svg|eot|woff|ttf)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                publicPath: '/',
                exclude: /srcDeprecated/,
                name: '[path][name].[ext]',
              },
            },
          ],
        },
      ],
    },
    optimization: {
      minimize: minimized,
      minimizer: [
        ...(minimized ? [
          new TerserPlugin({
            parallel: true,
            terserOptions: {
              // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
              format: {
                comments: false,
              },
            },
          }),
        ] : []),
        new CssMinimizerPlugin({
          test: /\.css$/i,
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
              },
            ],
          },
        }),
      ],
    },
    resolve: {
      modules: [path.resolve(__dirname, source), 'node_modules'],
      extensions: ['*', '.js', '.jsx'],
      alias: {
        '@mui/styled-engine': '@mui/styled-engine-sc',
      },
    },
    output: {
      path: path.resolve(__dirname, './build'),
      filename: isWebApp ? '[name].[contenthash].js' : 'bundle.js',
      publicPath: isWebApp ? '/' : undefined,
    },
    // source-map is for OpenReplay
    devtool: 'source-map',
    plugins: [
      new CleanWebpackPlugin(),
      new ESLintPlugin({ failOnError: false, failOnWarning: false  }),
      new HtmlWebpackPlugin({
        title: 'WeConnect',
        template: path.resolve(__dirname, `./${source}/index.html`),
      }),
      ...(bundleAnalysis ? [
        new UnusedWebpackPlugin({  // Set ANALYSIS to true to list (likely) unused files
          directories: [path.join(__dirname, source)],
          exclude: [
            '/**/cert/',
            '/**/global/svg-icons/',
            '/*.test.js',
            '/**/config*.*',
            'extension.html',
            '/sass/',
            '/robots.txt',
            'srcDeprecated',
          ],
          root: __dirname,
        }),
        new BundleAnalyzerPlugin(),
      ] : []),
      new CopyPlugin({
        patterns: [
          { from: `${source}/robots.txt`,  to: '.' },
          {
            from: `${source}/img`,
            to: 'img/',
            globOptions: { ignore: ['**/DO-NOT-BUNDLE/**']},
          },
        ],
      }),
      new WebpackShellPluginNext({
        onBuildEnd: {
          scripts: ['node ./src/js/common/node/webPackPostBuild.js'],
          blocking: false,
          parallel: true,
        },
      }),
      ...(argv.mode === 'production' ? [
        new webpack.DefinePlugin({
          // We need to get webpack into production mode, to make it include the much smaller minimized libraries
          // especially for React itself.
          // PRODUCTION: JSON.stringify(true),
          'process.env.NODE_ENV': JSON.stringify('production'),
          WEBPACK_NODE_VERSION: JSON.stringify(stats.nodeVersion),
          WEBPACK_NPM_VERSION: JSON.stringify(stats?.npmVersion || 'none'),
          WEBPACK_PULL_REQUEST: JSON.stringify(stats?.Pull_request || 'none'),
          WEBPACK_GIT_DATE: JSON.stringify(stats?.Git_committed_date || 'none'),
          WEBPACK_GIT_HASH: JSON.stringify(stats?.Git_commit_hash || 'none'),
        }),
      ] : [
        new webpack.DefinePlugin({
          WEBPACK_NODE_VERSION: JSON.stringify(stats?.nodeVersion || 'none'),
          WEBPACK_NPM_VERSION: JSON.stringify(stats?.npmVersion || 'none'),
          WEBPACK_PULL_REQUEST: JSON.stringify(stats?.Pull_request || 'none'),
          WEBPACK_GIT_DATE: JSON.stringify(stats?.Git_committed_date || 'none'),
          WEBPACK_GIT_HASH: JSON.stringify(stats?.Git_commit_hash || 'none'),
        }),
        new SourceMapDevToolPlugin({
          filename: isWebApp ? null : '[file].map', // if no value is provided the sourcemap is inlined
          exclude: [/node_modules/, /css/],
        }),
      ]),
    ],
    devServer: {
      allowedHosts: ['wevotedeveloper.com', 'localhost'],
      static: {
        directory: path.join(__dirname, './build/index.html'),
      },
      host: (useRealCerts ? 'wevotedeveloper.com' : 'localhost'),
      port,
      historyApiFallback: true,
      ...(isHTTPS ? {
        server: {
          type: 'https',
          options: {
            ...(useRealCerts ? {
              // For testing with Cordova and real authoritative certs
              key: fs.readFileSync(`./${source}/cert/wevotedeveloper.com_key.txt`),
              cert: fs.readFileSync(`./${source}/cert/wevotedeveloper.com.crt`),
              // requestCert: true,
              // passphrase: 'webpack-dev-server',
            } : {
              key: fs.readFileSync(`./${source}/cert/server.key`),
              cert: fs.readFileSync(`./${source}/cert/server.crt`),
            }),
          },
        },
      } : {}),
      client: {
        overlay: {
          runtimeErrors: (error) => {
            if (error.message.includes('ResizeObserver loop')) {
              return false;
            }
            return true;
          },
        },
      },
    },
  };
};
