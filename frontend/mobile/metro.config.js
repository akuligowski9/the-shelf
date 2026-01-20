const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const sharedRoot = path.resolve(projectRoot, '../shared');

const config = getDefaultConfig(projectRoot);

// Watch the shared folder for changes
config.watchFolders = [sharedRoot];

// Resolve modules from both the mobile and shared folders
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Make sure we can resolve files from the shared folder
config.resolver.extraNodeModules = {
  '@shared': sharedRoot,
};

module.exports = config;
