var cachedModules = {};

function loadPaths(paths, existingfiles) {
  for (var i=0; i<paths.length; i++) {
    if (existingfiles[paths[i]]) {
      return {moduleFn: existingfiles[paths[i]], path: paths[i]};
    }
  }
}

function loadAsFile(dependency, existingfiles) {
  return loadPaths([dependency, dependency + '.js'], existingfiles);
}

function loadAsDirectory(dependency, existingfiles) {
  if (existingfiles[dependency + '/package.json']) {
    return loadAsFile(dependency + '/' + existingfiles[dependency + '/package.json'].main, existingfiles);
  }
  return loadPaths([dependency + '/index.js'], existingfiles);
}

function runModule(moduleFn, dependencyPath) {

  var module = cachedModules[dependencyPath];
  if (module === undefined) {
    module = { exports: {} };
    cachedModules[dependencyPath] = module;
    moduleFn(requireFn(dependencyPath), module, module.exports);
  }

  return module.exports;
}

function require(requiringFile, dependency) {

  var moduleToRun, normalizedDepPath;

  if (!isFullPath(requiringFile)) throw new Error("requiringFile path should be full path, but was [" + requiringFile + "]");
  if (isNpmModulePath(dependency))requiringFile = window.__cjs_modules_root__ + '/file.js';

  normalizedDepPath = normalizePath(requiringFile, dependency);
  moduleToRun = loadAsFile(normalizedDepPath, window.__cjs_module__) || loadAsDirectory(normalizedDepPath, window.__cjs_module__);

  if (moduleToRun) {
    return runModule(moduleToRun.moduleFn, moduleToRun.path)
  } else {
    //none of the candidate paths was matching - throw
    throw new Error("Could not find module '" + dependency + "' from '" + requiringFile + "'");
  }
}

function requireFn(basepath) {
    return function(dependency) {
        return require(basepath, dependency);
    };
}

function isFullPath(path) {
  var unixFullPath = (path.charAt(0) === "/");
  var windowsFullPath = (path.indexOf(":") !== -1);

  return unixFullPath || windowsFullPath;
}

function isNpmModulePath(path) {
  return !isFullPath(path) && path.charAt(0) != '.';
}

function normalizePath(basePath, relativePath) {

  if (isFullPath(relativePath)) {
    basePath = '';
  }

  var baseComponents = basePath.split("/");
  var relativeComponents = relativePath.split("/");
  var nextComponent;

  // remove file portion of basePath before starting
  baseComponents.pop();

  while (relativeComponents.length > 0) {
    nextComponent = relativeComponents.shift();

    if (nextComponent === ".") continue;
    else if (nextComponent === "..") baseComponents.pop();
    else baseComponents.push(nextComponent);
  }

  return baseComponents.join("/");
}