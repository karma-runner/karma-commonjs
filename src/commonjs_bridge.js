var cachedModules = {};

// load all modules
for (var modulePath in window.__cjs_module__) {
    require(modulePath, modulePath);
};

function normalizeMockKeys(parent, mocks, modulesRoot) {
    var normalizedMocks = {};
    for(var relativePath in mocks) {
        if(mocks.hasOwnProperty(relativePath)) {
            var normalizedPath = normalizePath(parent, relativePath, modulesRoot);
            normalizedMocks[normalizedPath] = mocks[relativePath];
        }
    }
    return normalizedMocks;
}

function require(requiringFile, dependency, mocks) {

    if (window.__cjs_module__ === undefined) throw new Error("Could not find any modules. Did you remember to set 'preprocessors' in your Karma config?");
    if (window.__cjs_modules_root__ === undefined) throw new Error("Could not find CommonJS module root path. Please report this issue to the karma-commonjs project.");

    dependency = normalizePath(requiringFile, dependency, window.__cjs_modules_root__ || '');

    // return mocked dependency if one is declared
    if(mocks && mocks[dependency] !== undefined) {
        return mocks[dependency];
    }

    // find module
    var moduleFn = window.__cjs_module__[dependency];
    if (moduleFn === undefined) throw new Error("Could not find module '" + dependency + "' from '" + requiringFile + "'");

    // run the module (if necessary)
    var module;
    if(!mocks) {
        module = cachedModules[dependency];
    }

    if (module === undefined) {
        module = { exports: {} };
        if(!mocks) {
            cachedModules[dependency] = module;
        }
        moduleFn(requireFn(dependency, mocks), module, module.exports);
    }

    return module.exports;
};

function requireFn(basepath, bubbledMocks) {
    return function(dependency, mocks) {
        var fullPathMocks;
        if(mocks) {
            fullPathMocks = normalizeMockKeys(basepath, mocks, window.__cjs_modules_root__ || '');
        }
        return require(basepath, dependency, fullPathMocks || bubbledMocks);
    };
};

function normalizePath(basePath, relativePath, modulesRoot) {

    if (isFullPath(relativePath)) return relativePath;
    if (isNpmModulePath(relativePath)) basePath = modulesRoot;
    if (!isFullPath(basePath)) throw new Error("basePath should be full path, but was [" + basePath + "]");

    var relativePathLeadingChar = relativePath.charAt(0);

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

    if (normalizedPath.substr(normalizedPath.length - 3) !== ".js") {
        normalizedPath += ".js";
    }

    return normalizedPath;


    function isFullPath(path) {
        var unixFullPath = (path.charAt(0) === "/");
        var windowsFullPath = (path.indexOf(":") !== -1);

        return unixFullPath || windowsFullPath;
    }

    function isNpmModulePath(path) {
      return path.charAt(0) !== ".";
    }
}