var path = require('path');

var BRIDGE_FILE_PATH = path.normalize(__dirname + '/../client/commonjs_bridge.js');

var initCommonJS = function(/* config.files */ files) {

  // Include the file that resolves all the dependencies on the client.
  files.push({
    pattern: BRIDGE_FILE_PATH,
    included: true,
    served: true,
    watched: false
  });
};


var createPreprocessor = function(config, logger) {
  var log = logger.create('preprocessor.commonjs');

  var resolvedMap = {};
  if (config.map) {
    var file;
    for (file in config.map) {
      if (config.map.hasOwnProperty(file)) {
        resolvedMap[path.resolve(file)] = config.map[file];
      }
    }
  }

  return function(content, file, done) {
    if (file.originalPath === BRIDGE_FILE_PATH) {
      return done(content);
    }

    var output = "";
    var path = file.originalPath;
    log.debug('Processing "%s".', file.originalPath);
    if (resolvedMap[path]) {
      path = resolvedMap[path];
      output =
        'window.__cjs_map__ = window.__cjs_map__ || {};' +
        'window.__cjs_map__["' + path + '"] = "' + file.originalPath + '";';
      log.debug('Mapping "%s" to "%s".', file.originalPath, path);
    }

    output +=
      'window.__cjs_module__ = window.__cjs_module__ || {};' +
      'window.__cjs_module__["' + path + '"] = function(require, module, exports) {' +
        content +
      '}';

    done(output);
  };
};

createPreprocessor.$inject = ['config.commonjs', 'logger'];

// PUBLISH DI MODULE
module.exports = {
  'framework:commonjs': ['factory', initCommonJS],
  'preprocessor:commonjs': ['factory', createPreprocessor]
};
