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
        expect(require('/folder/bar.js', '/folder/foo').foo).toBeTruthy();
      });

      it('should resolve absolute dependencies with relative components in the deps path', function () {
        expect(require('/folder/bar.js', '/folder/./foo.js').foo).toBeTruthy();
        expect(require('/folder/bar.js', '/folder/../folder/foo').foo).toBeTruthy();
      });

      it('should resolve relative dependencies', function () {
        expect(require('/folder/bar.js', './foo').foo).toBeTruthy();
        expect(require('/folder/bar.js', './foo.js').foo).toBeTruthy();
        expect(require('/folder/bar.js', './../folder/foo.js').foo).toBeTruthy();
      });

      it('should resolve dependencies to JSON files', function () {
        window.__cjs_module__['/folder/baz.json'] = {baz: 'baz'};
        expect(require('/folder/bar.js', './baz.json').baz).toEqual('baz');
      });

      it('should resolve dependencies to JSON files without extensions', function () {
        window.__cjs_module__['/folder/baz.json'] = {baz: 'baz'};
        expect(require('/folder/bar.js', './baz').baz).toEqual('baz');
      });

      it('should resolve dependencies to JS before resolving JSON', function () {
        window.__cjs_module__['/folder/foo.json'] = {foo: false};
        expect(require('/folder/bar.js', './foo').foo).toBeTruthy();
      });
    });

    describe('resolve from node_modules and configured modules root', function () {

      it('should resolve from the node_modules folder', function () {
        window.__cjs_module__['/folder/node_modules/mymodule/foo.js'] = function(require, module, exports) {
          exports.foo = true;
        };
        expect(require('/folder/bar.js', 'mymodule/foo').foo).toBeTruthy();
      });

      it('should resolve from the node_modules parent folder', function () {
        window.__cjs_module__['/folder/node_modules/mymodule/foo.js'] = function(require, module, exports) {
          exports.foo = true;
        };
        expect(require('/folder/subfolder/subsubfolder/bar.js', 'mymodule/foo').foo).toBeTruthy();
      });

      it('should resolve from the configured modules root', function () {
        window.__cjs_modules_root__ = '/root/node_modules';
        window.__cjs_module__['/root/node_modules/mymodule/foo.js'] = function(require, module, exports) {
          exports.foo = true;
        };
        expect(require('/folder/bar.js', 'mymodule/foo').foo).toBeTruthy();
        expect(require('/folder/bar.js', 'mymodule/foo.js').foo).toBeTruthy();
      });

      it('should resolve on Windows', function() {
        window.__cjs_module__['c:/folder/node_modules/mymodule/foo.js'] = function(require, module, exports) {
          exports.foo = true;
        };
        expect(require('c:/folder/bar.js', 'mymodule/foo').foo).toBeTruthy();
      });

    });

    describe('resolve from folders', function () {

      it('should be aware of index.js', function () {
        window.__cjs_module__['/folder/foo/index.js'] = function(require, module, exports) {
          exports.foo = true;
        };
        expect(require('/folder/bar.js', './foo').foo).toBeTruthy();
      });

      it('should resolve a file before resolving index.js', function () {
        window.__cjs_module__['/folder/foo.js'] = function(require, module, exports) {
          exports.foo = false;
        };
        expect(require('/folder/bar.js', './foo').foo).toBeFalsy();
      });

      it('should support package.json', function () {
        window.__cjs_module__['/somepackage/package.json'] = {
          main: 'foo/index.js'
        };
        window.__cjs_module__['/somepackage/foo/index.js'] = function(require, module, exports) {
          exports.foo = true;
        };
        expect(require('/folder/bar.js', '/somepackage').foo).toBeTruthy();
      });

      it('should support relative paths in package.json', function () {
        window.__cjs_module__['/somepackage/package.json'] = {
          main: 'foo/./../foo/index.js'
        };
        window.__cjs_module__['/somepackage/foo/index.js'] = function(require, module, exports) {
          exports.foo = true;
        };
        expect(require('/folder/bar.js', '/somepackage').foo).toBeTruthy();
      });

      it('should support package.json without suffix', function () {
        window.__cjs_module__['/somepackage/package.json'] = {
          main: 'foo/index'
        };
        window.__cjs_module__['/somepackage/foo/index.js'] = function(require, module, exports) {
          exports.foo = true;
        };
        expect(require('/folder/bar.js', '/somepackage').foo).toBeTruthy();
      });

    });

    describe('__dirname and __filename "globals"', function () {

      it('should expose __dirname "global"', function () {
        window.__cjs_module__['/folder/file.js'] = function(require, module, exports, __dirname) {
          exports.dirname = __dirname;
        };
        expect(require('/foo/bar/baz.js', '/folder/file.js').dirname).toEqual('/foo/bar');
      });

      it('should expose __filename "global"', function () {
        window.__cjs_module__['/folder/file.js'] = function(require, module, exports, __dirname, __filename) {
          exports.filename = __filename;
        };
        expect(require('/foo/bar/baz.js', '/folder/file.js').filename).toEqual('baz.js');
      });

    });

    describe('resolve - corner cases', function () {

      it('should throw error when require base path is not absolute', function () {
        expect(function () {
          require('file.js', './bar')
        }).toThrow(new Error("requiringFile path should be full path, but was [file.js]"));
      });

      it('should throw error when a required module does not exist', function () {
        expect(function () {
          require('/file.js', './bar')
        }).toThrow(new Error("Could not find module './bar' from '/file.js'"));
      });

      it('should propery report errors for files requiring from the root path', function () {
        expect(function () {
          require('/folder/somefile.js', 'bar/baz.js')
        }).toThrow(new Error("Could not find module 'bar/baz.js' from '/folder/somefile.js'"));
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
