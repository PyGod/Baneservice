import path from 'path';
import { merge } from 'webpack-merge';
import commonConfig from './webpack.common.mjs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import Dotenv from 'dotenv-webpack';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODE = process.env.NODE_ENV === 'development' ? 'development' : undefined;

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

const devConfig = {
  mode: MODE ?? 'development',
  output: {
    filename: '[name].js',
  },
  devtool: 'source-map',
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    open: true,
    port: 8080,
    hot: true,
    watchFiles: ['./public/**/*', './src/**/*', './dist/**/*'],
  },
  module: {
    rules: [
      {
        test: [/\.s[ac]ss$/i, /\.css$/i],
        type: 'javascript/auto',
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
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
            options: {
              sourceMap: true,
              implementation: 'sass',
            },
          },
        ],
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        type: 'javascript/auto',
        use: {
          loader: 'babel-loader',
          options: {
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
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(woff(2)?|ttf|eot)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[ext]',
        },
      },
      {
        test: [/\.(png|jpg|gif|svg|webp)$/i],
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]',
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
        test: [/\.ico$/i],
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Baneservice',
      template: 'src/index.html',
    }),
    new Dotenv(),
  ],
};

export default merge(commonConfig, devConfig);
