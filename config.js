function load(envName) {
    const envOverrides = {
        'production': () => require('./config/production.json'),
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

function log(configObj) {
    const repeatNum = 50
    console.log(`${"=".repeat(repeatNum)}\nenvConfig`)
    Object.entries(configObj).map(([key, value]) => {
        console.log(`  ${key}: ${value}`)
    })
    console.log(`${"=".repeat(repeatNum)}`)
}

module.exports = {
    load,
    log
};
