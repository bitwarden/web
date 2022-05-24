const fs = require("fs");
const path = require("path");

const { AngularWebpackPlugin } = require("@ngtools/webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackInjector = require("html-webpack-injector");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

const config = require("./config.js");
const pjson = require("./package.json");

const ENV = process.env.ENV == null ? "development" : process.env.ENV;
const NODE_ENV = process.env.NODE_ENV == null ? "development" : process.env.NODE_ENV;

const envConfig = config.load(ENV);
config.log(envConfig);

const moduleRules = [
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
    exclude: /.*(bwi-font)\.svg/,
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
  {
    test: /\.css$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
      },
      "css-loader",
      "postcss-loader",
    ],
  },
  {
    test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
    loader: "@ngtools/webpack",
  },
];

const plugins = [
  new CleanWebpackPlugin(),
  // ref: https://github.com/angular/angular/issues/20357
  new webpack.ContextReplacementPlugin(
    /\@angular(\\|\/)core(\\|\/)fesm5/,
    path.resolve(__dirname, "./src")
  ),
  new HtmlWebpackPlugin({
    template: "./src/index.html",
    filename: "index.html",
    chunks: ["theme_head", "app/polyfills", "app/vendor", "app/main"],
  }),
  new HtmlWebpackInjector(),
  new HtmlWebpackPlugin({
    template: "./src/connectors/duo.html",
    filename: "duo-connector.html",
    chunks: ["connectors/duo"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/connectors/webauthn.html",
    filename: "webauthn-connector.html",
    chunks: ["connectors/webauthn"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/connectors/webauthn-mobile.html",
    filename: "webauthn-mobile-connector.html",
    chunks: ["connectors/webauthn"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/connectors/webauthn-fallback.html",
    filename: "webauthn-fallback-connector.html",
    chunks: ["connectors/webauthn-fallback"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/connectors/sso.html",
    filename: "sso-connector.html",
    chunks: ["connectors/sso"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/connectors/captcha.html",
    filename: "captcha-connector.html",
    chunks: ["connectors/captcha"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/connectors/captcha-mobile.html",
    filename: "captcha-mobile-connector.html",
    chunks: ["connectors/captcha"],
  }),
  new CopyWebpackPlugin({
    patterns: [
      { from: "./src/.nojekyll" },
      { from: "./src/manifest.json" },
      { from: "./src/favicon.ico" },
      { from: "./src/browserconfig.xml" },
      { from: "./src/app-id.json" },
      { from: "./src/404.html" },
      { from: "./src/404", to: "404" },
      { from: "./src/images", to: "images" },
      { from: "./src/locales", to: "locales" },
      { from: "./node_modules/qrious/dist/qrious.min.js", to: "scripts" },
      { from: "./node_modules/braintree-web-drop-in/dist/browser/dropin.js", to: "scripts" },
      {
        from: "./src/version.json",
        transform(content, path) {
          return content.toString().replace("process.env.APPLICATION_VERSION", pjson.version);
        },
      },
    ],
  }),
  new MiniCssExtractPlugin({
    filename: "[name].[contenthash].css",
    chunkFilename: "[id].[contenthash].css",
  }),
  new webpack.EnvironmentPlugin({
    ENV: ENV,
    NODE_ENV: NODE_ENV === "production" ? "production" : "development",
    APPLICATION_VERSION: pjson.version,
    CACHE_TAG: Math.random().toString(36).substring(7),
    URLS: envConfig["urls"] ?? {},
    STRIPE_KEY: envConfig["stripeKey"] ?? "",
    BRAINTREE_KEY: envConfig["braintreeKey"] ?? "",
    PAYPAL_CONFIG: envConfig["paypal"] ?? {},
  }),
  new webpack.ProvidePlugin({
    process: "process/browser",
  }),
  new AngularWebpackPlugin({
    tsConfigPath: "tsconfig.json",
    entryModule: "src/app/app.module#AppModule",
    sourceMap: true,
  }),
];

// ref: https://webpack.js.org/configuration/dev-server/#devserver
let certSuffix = fs.existsSync("dev-server.local.pem") ? ".local" : ".shared";
const devServer =
  NODE_ENV !== "development"
    ? {}
    : {
        server: {
          type: "https",
          options: {
            key: fs.readFileSync("dev-server" + certSuffix + ".pem"),
            cert: fs.readFileSync("dev-server" + certSuffix + ".pem"),
          },
        },
        // host: '192.168.1.9',
        proxy: {
          "/api": {
            target: envConfig.dev?.proxyApi,
            pathRewrite: { "^/api": "" },
            secure: false,
            changeOrigin: true,
          },
          "/identity": {
            target: envConfig.dev?.proxyIdentity,
            pathRewrite: { "^/identity": "" },
            secure: false,
            changeOrigin: true,
          },
          "/events": {
            target: envConfig.dev?.proxyEvents,
            pathRewrite: { "^/events": "" },
            secure: false,
            changeOrigin: true,
          },
          "/notifications": {
            target: envConfig.dev?.proxyNotifications,
            pathRewrite: { "^/notifications": "" },
            secure: false,
            changeOrigin: true,
          },
        },
        headers: (req) => {
          if (!req.originalUrl.includes("connector.html")) {
            return [
              {
                key: "Content-Security-Policy",
                value: `
                  default-src 'self'; 
                  script-src 
                    'self'
                    'sha256-ryoU+5+IUZTuUyTElqkrQGBJXr1brEv6r2CA62WUw8w='
                    https://js.stripe.com
                    https://js.braintreegateway.com
                    https://www.paypalobjects.com;
                  style-src
                    'self'
                    https://assets.braintreegateway.com
                    https://*.paypal.com
                    'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='
                    'sha256-JVRXyYPueLWdwGwY9m/7u4QlZ1xeQdqUj2t8OVIzZE4=';
                    'sha256-0xHKHIT3+e2Gknxsm/cpErSprhL+o254L/y5bljg74U='
                  img-src
                    'self'
                    data:
                      https://icons.bitwarden.net
                      https://*.paypal.com
                      https://www.paypalobjects.com
                      https://q.stripe.com
                      https://haveibeenpwned.com
                      https://www.gravatar.com;
                  child-src
                    'self'
                    https://js.stripe.com
                    https://assets.braintreegateway.com
                    https://*.paypal.com
                    https://*.duosecurity.com;
                  frame-src
                    'self'
                    https://js.stripe.com
                    https://assets.braintreegateway.com
                    https://*.paypal.com
                    https://*.duosecurity.com;
                  connect-src
                    'self'
                    wss://notifications.bitwarden.com
                    https://notifications.bitwarden.com
                    https://cdn.bitwarden.net
                    https://api.pwnedpasswords.com
                    https://2fa.directory/api/v3/totp.json
                    https://api.stripe.com
                    https://www.paypal.com
                    https://api.braintreegateway.com
                    https://client-analytics.braintreegateway.com
                    https://*.braintree-api.com
                    https://*.blob.core.windows.net
                    https://app.simplelogin.io/api/alias/random/new
                    https://app.anonaddy.com/api/v1/aliases;
                  object-src 
                    'self'
                    blob:;`,
              },
            ];
          }
        },
        hot: false,
        port: envConfig.dev?.port ?? 8080,
        allowedHosts: envConfig.dev?.allowedHosts ?? "auto",
        client: {
          overlay: {
            errors: true,
            warnings: false,
          },
        },
      };

const webpackConfig = {
  mode: NODE_ENV,
  devtool: "source-map",
  devServer: devServer,
  entry: {
    "app/polyfills": "./src/app/polyfills.ts",
    "app/main": "./src/app/main.ts",
    "connectors/webauthn": "./src/connectors/webauthn.ts",
    "connectors/webauthn-fallback": "./src/connectors/webauthn-fallback.ts",
    "connectors/duo": "./src/connectors/duo.ts",
    "connectors/sso": "./src/connectors/sso.ts",
    "connectors/captcha": "./src/connectors/captcha.ts",
    theme_head: "./src/theme.js",
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
          // Replicate Angular CLI behaviour
          compress: {
            global_defs: {
              ngDevMode: false,
              ngI18nClosureMode: false,
            },
          },
        },
      }),
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    symlinks: false,
    modules: [path.resolve("node_modules")],
    alias: {
      sweetalert2: require.resolve("sweetalert2/dist/sweetalert2.js"),
      "#sweetalert2": require.resolve("sweetalert2/src/sweetalert2.scss"),
    },
    fallback: {
      buffer: false,
      util: require.resolve("util/"),
      assert: false,
      url: false,
    },
  },
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "build"),
  },
  module: { rules: moduleRules },
  plugins: plugins,
};

module.exports = webpackConfig;
