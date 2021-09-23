const config = require('../../config.js');

const envConfig = config.load('development');
config.log(envConfig);

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
    "../../src/**/*.stories.mdx",
    "../../src/**/*.stories.@(js|jsx|ts|tsx)",
    "../../jslib/angular/src/**/*.stories.mdx",
    "../../jslib/angular/src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  babel: async (options) => ({
    ...options,
    // any extra options you want to set
    plugins: [],
    presets: [],
  }),

  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    const plugin = config.plugins.find(plugin => plugin.definitions?.['process.env']);
    // add my env vars

    plugin.definitions['process.env.URLS'] = JSON.stringify(envConfig.urls);

    // Return the altered config
    return config;
  },
}