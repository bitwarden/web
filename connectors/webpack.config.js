const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInjector = require("html-webpack-injector");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const pjson = require("../package.json");

const NODE_ENV = process.env.NODE_ENV == null ? "development" : process.env.NODE_ENV;

const moduleRules = [
  {
    test: /\.ts$/,
    enforce: "pre",
    loader: "tslint-loader",
  },
  {
    test: /\.tsx?$/,
    use: [
      {
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  {
    test: /\.(html)$/,
    loader: "html-loader",
  },
  {
    test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
    exclude: /loading(|-white).svg/,
    generator: {
      filename: "fonts/[name][ext]",
    },
    type: "asset/resource",
  },
  {
    test: /\.(jpe?g|png|gif|svg|webp|avif)$/i,
    exclude: /.*(fontawesome-webfont)\.svg/,
    generator: {
      filename: "images/[name][ext]",
    },
    type: "asset/resource",
  },
  {
    test: /\.scss$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
      },
      "css-loader",
      "sass-loader",
    ],
  },
];

const plugins = [
  new HtmlWebpackInjector(),
  new HtmlWebpackPlugin({
    template: "./src/duo.html",
    filename: "duo.html",
    chunks: ["connectors/duo"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/webauthn.html",
    filename: "webauthn.html",
    chunks: ["connectors/webauthn"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/webauthn-mobile.html",
    filename: "webauthn-mobile.html",
    chunks: ["connectors/webauthn"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/webauthn-fallback.html",
    filename: "webauthn-fallback.html",
    chunks: ["connectors/webauthn-fallback"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/sso.html",
    filename: "sso.html",
    chunks: ["connectors/sso"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/captcha.html",
    filename: "captcha.html",
    chunks: ["connectors/captcha"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/captcha-mobile.html",
    filename: "captcha-mobile.html",
    chunks: ["connectors/captcha"],
  }),

  new MiniCssExtractPlugin({
    filename: "[name].[contenthash].css",
    chunkFilename: "[id].[contenthash].css",
  }),
];

const webpackConfig = {
  mode: NODE_ENV,
  devtool: "source-map",
  entry: {
    "connectors/webauthn": "./src/webauthn/webauthn.ts",
    "connectors/webauthn-fallback": "./src/webauthn/webauthn-fallback.ts",
    "connectors/duo": "./src/duo/duo.ts",
    "connectors/sso": "./src/sso/sso.ts",
    "connectors/captcha": "./src/captcha/captcha.ts",
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "app/vendor",
          chunks: (chunk) => {
            return chunk.name === "app/main";
          },
        },
      },
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          safari10: true,
        },
      }),
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    symlinks: false,
    modules: [path.resolve("../", "node_modules")],
    fallback: {
      buffer: false,
      util: require.resolve("util/"),
      assert: false,
    },
  },
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "build"),
    clean: true,
  },
  module: { rules: moduleRules },
  plugins: plugins,
};

module.exports = webpackConfig;
