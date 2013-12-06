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

	});
});