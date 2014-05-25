describe('client', function() {

  describe('require high level tests', function () {

    beforeEach(function(){
      window.__cjs_module__ = {};
      window.__cjs_modules_root__ = '/root';
      cachedModules = {};
    });

    describe('resolve from a file', function () {

      beforeEach(function () {
        window.__cjs_module__['/folder/foo.js'] = function(require, module, exports) {
          exports.foo = true;
        };
      });

      it('should resolve absolute dependencies', function () {
        expect(require('/folder/bar.js', '/folder/foo.js').foo).toBeTruthy();
        //TODO: check how this works in node: expect(require('/folder/bar.js', '/folder/foo').foo).toBeTruthy();
      });

      it('should resolve relative dependencies', function () {
        expect(require('/folder/bar.js', './foo').foo).toBeTruthy();
        expect(require('/folder/bar.js', './foo.js').foo).toBeTruthy();
        expect(require('/folder/bar.js', './../folder/foo.js').foo).toBeTruthy();
      });
    });

    describe('resolve from node_modules', function () {

      beforeEach(function () {
        window.__cjs_modules_root__ = '/root/node_modules';
        window.__cjs_module__['/root/node_modules/mymodule/foo.js'] = function(require, module, exports) {
          exports.foo = true;
        };
      });

      it('should resolve node_modules dependencies', function () {
        expect(require('/folder/bar.js', 'mymodule/foo').foo).toBeTruthy();
        expect(require('/folder/bar.js', 'mymodule/foo.js').foo).toBeTruthy();
      });

    });

    describe('resolve from folders', function () {

      beforeEach(function () {
        window.__cjs_module__['/folder/foo/index.js'] = function(require, module, exports) {
          exports.foo = true;
        };
      });

      it('should be aware of index.js', function () {
        expect(require('/folder/bar.js', './foo').foo).toBeTruthy();
      });

      it('should resolve a file before resolving index.js', function () {
        window.__cjs_module__['/folder/foo.js'] = function(require, module, exports) {
          exports.foo = false;
        };
        expect(require('/folder/bar.js', './foo').foo).toBeFalsy();
      });
    });

    describe('resolve - corner cases', function () {

      it('should throw error when require base path is not absolute', function () {
        expect(function () {
          require('file.js', './bar')
        }).toThrow(new Error("basePath should be full path, but was [file.js]"));
      });

      it('should throw error when a required module does not exist', function () {
        expect(function () {
          require('/file.js', './bar')
        }).toThrow(new Error("Could not find module './bar' from '/file.js'"));
      });

      it('should correctly resolve modules with circular dependencies issue #6', function(){

        window.__cjs_module__['/foo.js'] = function(require, module, exports) {
          var bar = require('./bar');
          exports.txt = 'foo';
          exports.getText = function() {
            return 'foo ' + bar.txt;
          };
        };

        window.__cjs_module__['/bar.js'] = function(require, module, exports) {
          var foo = require('./foo');
          exports.txt = 'bar';
          exports.getText = function() {
            return 'bar ' + foo.txt;
          }
        };

        expect(require('/app.js', './foo').getText()).toEqual('foo bar');
        expect(require('/app.js', './bar').getText()).toEqual('bar foo');
      });
    });
  });

});