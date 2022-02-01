const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInjector = require("html-webpack-injector");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

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
      filename: "fonts/[name].[contenthash][ext]",
    },
    type: "asset/resource",
  },
  {
    test: /\.(jpe?g|png|gif|svg|webp|avif)$/i,
    exclude: /.*(fontawesome-webfont)\.svg/,
    generator: {
      filename: "images/[name].[contenthash][ext]",
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
    chunks: ["duo"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/webauthn.html",
    filename: "webauthn.html",
    chunks: ["webauthn"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/webauthn-mobile.html",
    filename: "webauthn-mobile.html",
    chunks: ["webauthn"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/webauthn-fallback.html",
    filename: "webauthn-fallback.html",
    chunks: ["webauthn-fallback"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/sso.html",
    filename: "sso.html",
    chunks: ["sso"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/captcha.html",
    filename: "captcha.html",
    chunks: ["captcha"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/captcha-mobile.html",
    filename: "captcha-mobile.html",
    chunks: ["captcha"],
  }),
  new MiniCssExtractPlugin({
    filename: "assets/[name].[contenthash].css",
    chunkFilename: "assets/[id].[contenthash].css",
  }),
  new webpack.EnvironmentPlugin({
    CACHE_TAG: Math.random().toString(36).substring(7),
  }),
  new webpack.ProvidePlugin({
    process: "process/browser",
  }),
];

const webpackConfig = {
  mode: NODE_ENV,
  devtool: "source-map",
  entry: {
    webauthn: "./src/webauthn/webauthn.ts",
    "webauthn-fallback": "./src/webauthn/webauthn-fallback.ts",
    duo: "./src/duo/duo.ts",
    sso: "./src/sso/sso.ts",
    captcha: "./src/captcha/captcha.ts",
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
    filename: "assets/[name].[contenthash].js",
    path: path.resolve(__dirname, "build"),
    publicPath: "/connectors/",
    clean: true,
  },
  module: { rules: moduleRules },
  plugins: plugins,
};

module.exports = webpackConfig;
