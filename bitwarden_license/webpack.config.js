const { AngularWebpackPlugin } = require("@ngtools/webpack");

const webpackConfig = require("../webpack.config");

webpackConfig.entry["app/main"] = "./bitwarden_license/src/app/main.ts";
webpackConfig.plugins[webpackConfig.plugins.length - 1].entryModule = "bitwarden_license/src/app/app.module#AppModule";

module.exports = webpackConfig;
