/**
 * scripts.js
 * @name - 'scripts'
 * @task - Compiles & uglifies AMD modules
 */

const argv = require('yargs').boolean('p').argv;
const gulp = require('gulp');
const gulpif = require('gulp-if');
const named = require('vinyl-named');
const pack = require('webpack'); // Reference for plugins
const plumber = require('gulp-plumber');
const reload = require('browser-sync').reload;
const streamSize = require('./util/streamsize');
const webpack = require('webpack-stream');
const config = require('../config').scripts;

const isProduction = argv.p;

const webpackConfig = {
  cache: true,
  devtool: !isProduction ? 'source-map' : false,
  externals: config.externals,
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
        },
      },
    ],
  },
  plugins: [new pack.optimize.DedupePlugin()],
  quiet: isProduction,
};

if (isProduction) {
  webpackConfig.plugins.push(new pack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }));

  webpackConfig.plugins.push(new pack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
  }));
}

gulp.task('scripts', () => gulp.src(config.bundles)
  .pipe(plumber())
  .pipe(named())
  .pipe(webpack(webpackConfig))
  .pipe(gulp.dest(config.dest))
  .pipe(gulpif(isProduction, streamSize('JS')))
  .pipe(reload({ stream: true }))
);
