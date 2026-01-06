import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { glob } from 'glob';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EJSファイルをWebpackの監視対象に追加するプラグイン
class WatchEjsPlugin {
  constructor(patterns) {
    this.patterns = patterns;
  }

  apply(compiler) {
    compiler.hooks.afterCompile.tapAsync('WatchEjsPlugin', (compilation, callback) => {
      // globパターンにマッチするファイルを取得
      this.patterns.forEach((pattern) => {
        const files = glob.sync(pattern, { cwd: compiler.context });
        files.forEach((file) => {
          const filePath = path.resolve(compiler.context, file);
          compilation.fileDependencies.add(filePath);
        });
      });
      callback();
    });
  }
}

export default (env, argv) => {
  const isDev = argv.mode === 'development';
  const outputToDrupal = env?.output === 'drupal';

  // 出力先の切り替え
  const outputPath = outputToDrupal
    ? path.resolve(__dirname, '../web/themes/custom/my_theme')
    : path.resolve(__dirname, 'dist');

  // EJSページファイルを自動検出
  const pagesDir = path.resolve(__dirname, 'src/templates/pages');
  const pageFiles = fs.existsSync(pagesDir)
    ? fs.readdirSync(pagesDir).filter((file) => file.endsWith('.ejs'))
    : [];

  // EJSテンプレートをHTMLにコンパイルするカスタムローダー
  const templatesDir = path.resolve(__dirname, 'src/templates');

  const htmlPlugins = pageFiles.map((file) => {
    const name = file.replace('.ejs', '');
    const templatePath = path.resolve(pagesDir, file);

    return new HtmlWebpackPlugin({
      templateContent: () => {
        // 開発時はキャッシュを無効化してEJSを毎回読み込む
        const template = fs.readFileSync(templatePath, 'utf-8');
        return ejs.render(template, {}, {
          filename: templatePath,
          root: templatesDir,
          cache: !isDev,
        });
      },
      filename: `${name}.html`,
      inject: 'body',
      minify: !isDev,
      // 開発時はキャッシュを無効化
      cache: !isDev,
    });
  });

  // Drupal出力時はHTMLを生成しない
  if (outputToDrupal) {
    htmlPlugins.length = 0;
  }

  return {
    stats: isDev ? 'errors-warnings' : 'normal',
    entry: {
      main: './src/ts/main.ts',
      style: './src/scss/style.scss',
    },
    output: {
      path: outputPath,
      filename: outputToDrupal ? 'js/[name].js' : 'js/[name].[contenthash:8].js',
      clean: !outputToDrupal, // Drupal出力時はクリーンしない
      assetModuleFilename: 'assets/[name][ext]',
    },
    devtool: isDev ? 'source-map' : false,
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      port: 3000,
      open: true,
      hot: true,
      liveReload: true,
      watchFiles: {
        paths: ['src/templates/**/*.ejs', 'src/scss/**/*.scss'],
        options: {
          usePolling: false,
        },
      },
    },
    module: {
      rules: [
        // TypeScript
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }],
                '@babel/preset-typescript',
              ],
            },
          },
        },
        // SCSS
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                api: 'modern-compiler',
                sassOptions: {
                  style: isDev ? 'expanded' : 'compressed',
                },
              },
            },
          ],
        },
        // Images
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset/resource',
        },
        // Fonts
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: outputToDrupal ? 'css/[name].css' : 'css/[name].[contenthash:8].css',
      }),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          configFile: path.resolve(__dirname, 'tsconfig.json'),
        },
      }),
      // EJSファイルを監視対象に追加
      new WatchEjsPlugin(['src/templates/**/*.ejs']),
      ...htmlPlugins,
    ],
    optimization: {
      minimizer: ['...', new CssMinimizerPlugin()],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
};
