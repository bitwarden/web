const config = require("./config.js");

const ENV = process.env.ENV == null ? "development" : process.env.ENV;

const envConfig = config.load(ENV);
config.log(envConfig);

module.exports = {
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
};
