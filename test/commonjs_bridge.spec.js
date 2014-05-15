describe('client', function() {

	beforeEach(function(){
		window.__cjs_module__ = {};
		window.__cjs_modules_root__ = '/root';
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

	describe('path resolving and normalization', function(){

		it('should properly resolve full paths', function(){
			expect(normalizePath('/base/foo.js', '/home/bar.js')).toEqual('/home/bar.js');
		});

		it('should properly resolve relative paths starting with .', function(){
			expect(normalizePath('/base/foo.js', './bar.js')).toEqual('/base/bar.js');
		});

		it('should properly resolve relative paths starting with ..', function(){
			expect(normalizePath('/base/sub/foo.js', '../bar.js')).toEqual('/base/bar.js');
		});

		it('should add .js suffix if necessery', function(){
			expect(normalizePath('/foo.js', './bar')).toEqual('/bar.js');
		});

		it('should properly handle .. and . inside paths', function(){
			expect(normalizePath('/base/sub/foo.js', './other/../../sub2/./bar.js')).toEqual('/base/sub2/bar.js');
		});

		it('should resolve paths without qualifiers as relative to a defined root', function(){
			expect(normalizePath('/base/foo.js', 'bar', '/my/root')).toEqual('/my/root/bar.js');
		});

        it('should properly resolve full paths to mocks', function() {
            var mocks = {
                '../src/a-mock': 'mocked module a',
                '../src/b-mock': 'mocked module b',
            }

            var expected = {
                '/base/src/a-mock.js': 'mocked module a',
                '/base/src/b-mock.js': 'mocked module b'
            }

            expect(normalizeMockPaths('/base/test/foo-spec.js', mocks)).toEqual(expected);
        });
	});

    describe('module mocking', function() {

        it('should return a mocked dependency if one is found', function () {
            var requiringFile = '/base/foo.js';
            var dependency = '/base/dependency1';
            var mocks = {
                '/base/dependency1': jasmine.createSpy('dependency1 mock')
            };

            var result = require(requiringFile, dependency, mocks);
            expect(result).toBe(mocks['/base/dependency1']);
        });

        it('should return cached module if no mocks passed in', function () {
            var requiringFile = '/base/foo.js';
            var dependency = '/base/dependency1';
            var originalModule = {
                exports: jasmine.createSpy('dependency1 module')
            };
            window.__cjs_module__[dependency] = originalModule;

            cachedModules[dependency] = originalModule;

            var result = require(requiringFile, dependency);
            expect(result).toBe(originalModule.exports);
        });

        it('should pass on mocks to sub modules', function () {
            var requiringFile = '/base/foo.js';
            var dependency = '/base/dependency1';
            var originalModule = jasmine.createSpy('dependency1 module');
            window.__cjs_module__[dependency] = originalModule;

            var mocks = {
                '/base/dependency2': jasmine.createSpy('dependency2 mock')
            };

            require(requiringFile, dependency, mocks);
            var capturedRequireFn = originalModule.mostRecentCall.args[0];

            var result = capturedRequireFn('/base/dependency2');
            expect(result).toBe(mocks['/base/dependency2']);
        });

    });


});