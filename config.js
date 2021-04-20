function load(envName) {
    const envOverrides = {
        'produciton': () => require('./config/production.json'),
        'qa': () => require('./config/qa.json'),
        'development': () => require('./config/development.json'),
    };

    const baseConfig = require('./config/base.json');
    const overrideConfig = envOverrides.hasOwnProperty(envName) ? envOverrides[envName]() : {};

    return {
        ...baseConfig,
        ...overrideConfig
    };
}

module.exports = {
    load
};
