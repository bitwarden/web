function load(envName) {
    const envOverrides = {
        'production': () => loadConfig('production'),
        'qa': () => loadConfig('qa'),
        'development': () => loadConfig('development'),
        'local': () => loadConfig('local'),
    };

    const baseConfig = require('./config/base.json');


    return {
        ...baseConfig,
        ...envOverrides[envName](),
        ...envOverrides['local'](),
    };
}

function log(configObj) {
    const repeatNum = 50
    console.log(`${"=".repeat(repeatNum)}\nenvConfig`)
    console.log(JSON.stringify(configObj, null, 2));
    console.log(`${"=".repeat(repeatNum)}`)
}

function loadConfig(configName) {
    try {
        return require(`./config/${configName}.json`);
    }
    catch (e) {
        if (e instanceof Error && e.code === "MODULE_NOT_FOUND")
            return {};
        else
            throw e;
    }
}

module.exports = {
    load,
    log
};
