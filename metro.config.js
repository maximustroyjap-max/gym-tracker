const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude remotion-splash from Metro bundling to avoid module resolution conflicts
config.resolver.blockList = [/remotion-splash\/.*/];

module.exports = config;
