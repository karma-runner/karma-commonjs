var path = require('path');


var initCommonJS = function(/* config.files */ files) {

  // Include the file that resolves all the dependencies on the client.
  files.push({
    pattern: path.normalize(__dirname + '/../client/commonjs_bridge.js'),
    included: true,
    served: true,
    watched: false
  });
};


var createPreprocesor = function(logger) {
  var log = logger.create('preprocessor.commonjs');

  return function(content, file, done) {
    log.debug('Processing "%s".', file.originalPath);

    var output =
      'window.__cjs_module__ = window.__cjs_module__ || {};' +
      'window.__cjs_module__["' + file.originalPath + '"] = function(require, module, exports) {' +
        content +
      '}';

    done(output);
  };
};


// PUBLISH DI MODULE
module.exports = {
  'framework:commonjs': ['factory', initCommonJS],
  'preprocessor:commonjs': ['factory', createPreprocesor]
};
