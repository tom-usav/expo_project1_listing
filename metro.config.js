const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Keep your custom Metro settings here.
// Example:
// config.resolver.sourceExts.push('cjs');

module.exports = config;