var path = require('path');
var os = require('os');

var BRIDGE_FILE_PATH = path.normalize(__dirname + '/../client/commonjs_bridge.js');
var DEFAULT_MODULES_ROOT_PATH = path.normalize(__dirname + '/../..');  //should point to node_modules

var initCommonJS = function(/* config.files */ files) {

  // Include the file that resolves all the dependencies on the client.
  files.push({
    pattern: BRIDGE_FILE_PATH,
    included: true,
    served: true,
    watched: false
  });
};

var calculateRootPathForModules = function(config) {
   var modulesRootPath = config.modulesRoot ? path.join(__dirname, '/../../..', config.modulesRoot) : DEFAULT_MODULES_ROOT_PATH;
   return path.resolve(modulesRootPath);
}

var createPreprocesor = function(logger, config) {
  var log = logger.create('preprocessor.commonjs');
  var modulesRootIncluded = false;
  var modulesRootPath = calculateRootPathForModules(config || {});

  log.debug('Configured root path for modules "%s".', modulesRootPath);

  return function(content, file, done) {
    if (file.originalPath === BRIDGE_FILE_PATH) {
      return done(content);
    }

    log.debug('Processing "%s".', file.originalPath);

    var output =
      'window.__cjs_module__ = window.__cjs_module__ || {};' +
      'window.__cjs_module__["' + file.originalPath + '"] = function(require, module, exports) {' +
        content + os.EOL +
      '}';

    // output root folder configuration if needed  
    if (!modulesRootIncluded) {
      output = 'window.__cjs_modules_root__ = "' + modulesRootPath + '";' + output;
      modulesRootIncluded = true;
    }

    done(output);
  };
};
createPreprocesor.$inject = ['logger', 'config.commonjsPreprocessor'];

// PUBLISH DI MODULE
module.exports = {
  'framework:commonjs': ['factory', initCommonJS],
  'preprocessor:commonjs': ['factory', createPreprocesor]
};
