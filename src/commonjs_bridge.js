var cachedModules = {};

// load all modules
for (var modulePath in window.__cjs_module__) {
    require(modulePath, modulePath);
}

function require(requiringFile, dependency) {

    if (window.__cjs_module__ === undefined) throw new Error("Could not find any modules. Did you remember to set 'preprocessors' in your Karma config?");
    if (window.__cjs_modules_root__ === undefined) throw new Error("Could not find CommonJS module root path. Please report this issue to the karma-commonjs project.");

    var dependencyPaths = getDependencyPathCandidates(requiringFile, dependency, window.__cjs_modules_root__);
    var dependencyPath;

    for (var i=0; i<dependencyPaths.length; i++) {

      dependencyPath = dependencyPaths[i];

      // find module
      var moduleFn = window.__cjs_module__[dependencyPath];
      if (moduleFn !== undefined) {

        // run the module (if necessary)
        var module = cachedModules[dependencyPath];
        if (module === undefined) {
          module = { exports: {} };
          cachedModules[dependencyPath] = module;
          moduleFn(requireFn(dependencyPath), module, module.exports);
        }

        return module.exports;
      }
    }

    //none of the candidate paths was matching - throw
    throw new Error("Could not find module '" + dependency + "' from '" + requiringFile + "'");
}

function requireFn(basepath) {
    return function(dependency) {
        return require(basepath, dependency);
    };
}

function getDependencyPathCandidates(basePath, relativePath, modulesRoot) {

    if (isFullPath(relativePath)) return [relativePath];
    if (isNpmModulePath(relativePath)) basePath = modulesRoot;
    if (!isFullPath(basePath)) throw new Error("basePath should be full path, but was [" + basePath + "]");

    var baseComponents = basePath.split("/");
    var relativeComponents = relativePath.split("/");
    var nextComponent;
    
    if (!isNpmModulePath(relativePath)) {
        baseComponents.pop();     // remove file portion of basePath before starting
    }
    while (relativeComponents.length > 0) {
        nextComponent = relativeComponents.shift();

        if (nextComponent === ".") continue;
        else if (nextComponent === "..") baseComponents.pop();
        else baseComponents.push(nextComponent);
    }

    var normalizedPath = baseComponents.join("/");
    var dependencyPathCandidates = [normalizedPath];

    if (normalizedPath.substr(normalizedPath.length - 3) !== ".js") {
        dependencyPathCandidates.push(normalizedPath + ".js");
        dependencyPathCandidates.push(normalizedPath + "/index.js");
    }

    return dependencyPathCandidates;


    function isFullPath(path) {
        var unixFullPath = (path.charAt(0) === "/");
        var windowsFullPath = (path.indexOf(":") !== -1);

        return unixFullPath || windowsFullPath;
    }

    function isNpmModulePath(path) {
      return path.charAt(0) !== ".";
    }
}