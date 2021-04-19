function load(envName) {
    const supportedEnvironments = ['production', 'qa', 'development'];
    
    if (envName === undefined) {
        envName = 'production'
        console.log('config: No specific env config provided. Defaulting to production');
    } 

    if (supportedEnvironments.indexOf(envName) === -1) {
        throw new Error(`Provided ENV not supported: ${envName}`);
    } 

    const baseConfig = require('./config/base.json');
    const overrideConfig = require(`./config/${envName}.json`);

    return {
        ...baseConfig,
        ...overrideConfig
    };
}

module.exports = {
    load
};
