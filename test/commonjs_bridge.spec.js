describe('client', function() {

	beforeEach(function(){
		window.__cjs_module__ = {};
	});

	it('should correctly resolve modules with circular dependencies issue #6', function(){

		 window.__cjs_module__['/foo.js'] = function(require, module, exports) {
		 	var bar = require('bar');
		 	exports.txt = 'foo';
		 	exports.getText = function() {
		 		return 'foo ' + bar.txt;
		 	};		 	
		 };

		 window.__cjs_module__['/bar.js'] = function(require, module, exports) {
		 	var foo = require('foo');
		 	exports.txt = 'bar';
		 	exports.getText = function() {
		 		return 'bar ' + foo.txt;
		 	}
		 };		

		expect(require('/app.js', 'foo').getText()).toEqual('foo bar');
		expect(require('/app.js', 'bar').getText()).toEqual('bar foo');
	});
});