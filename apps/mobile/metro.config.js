const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all workspace packages from the monorepo root
config.watchFolders = [monorepoRoot];

// Resolve workspace packages from source (.ts) instead of compiled dist (.js)
config.resolver.unstable_conditionNames = ["source", "import", "require"];
config.resolver.unstable_enablePackageExports = true;

// Modules that must resolve to a single copy (the app's copy).
// In pnpm monorepos, workspace packages can resolve their own copy of react
// from the .pnpm store, causing "Invalid hook call" / dual-React errors.
const singletonModules = ["react", "react-native", "react/jsx-runtime", "react/jsx-dev-runtime"];
const singletonMap = {};
for (const mod of singletonModules) {
  singletonMap[mod] = path.resolve(projectRoot, "node_modules", mod);
}

// TypeScript source files use .js extensions (ESM convention).
// Metro doesn't map .js → .ts like tsc does, so strip .js from relative
// imports and let Metro's own extension resolution find the .ts file.
// Also force singleton modules to resolve from the app's node_modules.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (singletonMap[moduleName]) {
    return context.resolveRequest(
      { ...context, originModulePath: path.resolve(projectRoot, "index.js") },
      moduleName,
      platform,
    );
  }
  if (moduleName.startsWith(".") && moduleName.endsWith(".js")) {
    return context.resolveRequest(context, moduleName.slice(0, -3), platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Let Metro resolve modules from both the app and the monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
