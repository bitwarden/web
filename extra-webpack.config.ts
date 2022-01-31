import { CustomWebpackBrowserSchema, TargetOptions } from "@angular-builders/custom-webpack";
import * as webpack from "webpack";
import * as CopyPlugin from "copy-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// We need to extend the default angular webpack to support web vault specific logic.
//
// Namely:
//   * Connectors
//   * Environment variables

export default (
  config: webpack.Configuration,
  options: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
  const plugins = [
    new HtmlWebpackPlugin({
      template: "./projects/web-vault-internal/src/connectors/duo.html",
      filename: "duo-connector.html",
      chunks: ["connectors/duo"],
    }),
    new HtmlWebpackPlugin({
      template: "./projects/web-vault-internal/src/connectors/webauthn.html",
      filename: "webauthn-connector.html",
      chunks: ["connectors/webauthn"],
    }),
    new HtmlWebpackPlugin({
      template: "./projects/web-vault-internal/src/connectors/webauthn-mobile.html",
      filename: "webauthn-mobile-connector.html",
      chunks: ["connectors/webauthn"],
    }),
    new HtmlWebpackPlugin({
      template: "./projects/web-vault-internal/src/connectors/webauthn-fallback.html",
      filename: "webauthn-fallback-connector.html",
      chunks: ["connectors/webauthn-fallback"],
    }),
    new HtmlWebpackPlugin({
      template: "./projects/web-vault-internal/src/connectors/sso.html",
      filename: "sso-connector.html",
      chunks: ["connectors/sso"],
    }),
    new HtmlWebpackPlugin({
      template: "./projects/web-vault-internal/src/connectors/captcha.html",
      filename: "captcha-connector.html",
      chunks: ["connectors/captcha"],
    }),
    new HtmlWebpackPlugin({
      template: "./projects/web-vault-internal/src/connectors/captcha-mobile.html",
      filename: "captcha-mobile-connector.html",
      chunks: ["connectors/captcha"],
    }),
    // TODO: Replace with angular cli copy
    new CopyPlugin({
      patterns: [
        {
          from: "./projects/web-vault-internal/src/version.json",
          transform(content, path) {
            return content.toString().replace("process.env.APPLICATION_VERSION", "12");
          },
        },
      ],
    }),
    new webpack.EnvironmentPlugin({
      ENV: "development",
      NODE_ENV: "development",
      APPLICATION_VERSION: "123",
      CACHE_TAG: Math.random().toString(36).substring(7),
      URLS: {},
      STRIPE_KEY: "",
      BRAINTREE_KEY: "",
      PAYPAL_CONFIG: {},
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ];

  config.plugins?.push(...plugins);

  (config.resolve as any).fallback = {
    buffer: false,
    util: require.resolve("util/"),
    assert: false,
  };

  // TODO: Figure out if we have to cast it to any
  (config.entry as any)["connectors/webauthn"] = [
    "./projects/web-vault-internal/src/connectors/webauthn.ts",
  ];
  (config.entry as any)["connectors/webauthn-fallback"] = [
    "./projects/web-vault-internal/src/connectors/webauthn-fallback.ts",
  ];
  (config.entry as any)["connectors/duo"] = ["./projects/web-vault-internal/src/connectors/duo.ts"];
  (config.entry as any)["connectors/sso"] = ["./projects/web-vault-internal/src/connectors/sso.ts"];
  (config.entry as any)["connectors/captcha"] = [
    "./projects/web-vault-internal/src/connectors/captcha.ts",
  ];

  return config;
};
