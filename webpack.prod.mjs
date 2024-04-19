import path from 'path';
import { merge } from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import commonConfig from './webpack.common.mjs';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlCriticalWebpackPlugin from 'html-critical-webpack-plugin';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import TerserPlugin from 'terser-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  await imagemin(
    [
      path
        .resolve(__dirname, 'public/assets/images/*.{jpg,png}')
        .replace(/\\/g, '/'),
    ],
    {
      destination: path
        .resolve(__dirname, 'dist/assets/images')
        .replace(/\\/g, '/'),
      plugins: [imageminWebp({ quality: 70 })],
    }
  );
})();

const prodConfig = {
  entry: {
    bundle: path.resolve(__dirname, './src/index.js'),
  },
  output: {
    filename: '[name].[contenthash].js',
  },
  performance: {
    hints: false,
    maxAssetSize: 512000,
    maxEntrypointSize: 512000,
  },
  cache: {
    type: 'filesystem',
    allowCollectingMemory: true,
  },
  module: {
    rules: [
      {
        test: [/\.s[ac]ss$/i, /\.css$/i],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-preset-env'],
              },
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: [/\.(png|jpg|gif|svg|webp)$/i],
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[contenthash].[ext]',
        },
      },
      {
        test: [/\.ico$/i],
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]',
        },
      },
      {
        test: [/\.mp4$/i],
        type: 'asset/resource',
        generator: {
          filename: 'assets/videos/[name][ext]',
        },
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        type: 'javascript/auto',
        use: {
          loader: 'babel-loader',
          options: {
            cacheCompression: false,
            cacheDirectory: true,
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: 'defaults',
                },
              ],
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-runtime',
            ],
          },
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[contenthash][ext]',
        },
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
              [
                'svgo',
                {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeViewBox: false,
                          addAttributesToSVGElement: {
                            params: {
                              attributes: [
                                { xmlns: 'http://www.w3.org/2000/svg' },
                              ],
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
      new CssMinimizerPlugin({
        parallel: true,
        minimizerOptions: [
          {
            preset: ['cssnano-preset-default'],
            plugins: [['postcss-preset-env']],
          },
        ],
        minify: [CssMinimizerPlugin.cleanCssMinify],
      }),
    ],
    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: true,
      minify: {
        html5: true,
        collapseWhitespace: true,
        keepClosingSlash: false,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'main.[contenthash].css',
      chunkFilename: '[id].css',
    }),
    new HtmlCriticalWebpackPlugin({
      base: path.resolve(__dirname, 'dist'),
      src: 'index.html',
      dest: 'index.html',
      inline: true,
      minify: true,
      extract: true,
      width: 375,
      height: 565,
    }),
    new TerserPlugin({
      test: /\.js(\?.*)?$/i,
      parallel: true,
      terserOptions: {
        ecma: '2015',
        compress: {
          ecma: '2015',
        },
        toplevel: true,
        ie8: true,
      },
    }),
  ],
};

export default merge(commonConfig, prodConfig);
