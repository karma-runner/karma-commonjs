describe('Tests for various utility functions', function () {

  describe('path type detection', function () {

    it('should correctly detect full paths', function () {

      expect(isFullPath('/unix/full/path')).toBeTruthy();
      expect(isFullPath('/unix/full/path/file.js')).toBeTruthy();

      expect(isFullPath('/c:/windows/full/path')).toBeTruthy();
      expect(isFullPath('/c:/windows/full/path/file.js')).toBeTruthy();

      expect(isFullPath('relative/path')).toBeFalsy();
      expect(isFullPath('./relative/path')).toBeFalsy();
      expect(isFullPath('../relative/path')).toBeFalsy();
    });

    it('should correctly detect node_modules paths', function () {

      expect(isNpmModulePath('foo/path/file.js')).toBeTruthy();

      expect(isNpmModulePath('/foo/path/file.js')).toBeFalsy();
      expect(isNpmModulePath('./foo/path/file.js')).toBeFalsy();
      expect(isNpmModulePath('../foo/path/file.js')).toBeFalsy();
    });

  });

  describe('normalize path', function () {

    it('should normalize relative path - happy path scenarios', function () {
      expect(normalizePath('/foo/bar/baz/file.js', 'rel')).toEqual('/foo/bar/baz/rel');
      expect(normalizePath('/foo/bar/baz/file.js', './rel')).toEqual('/foo/bar/baz/rel');
      expect(normalizePath('/foo/bar/baz/file.js', '../../rel')).toEqual('/foo/rel');
      expect(normalizePath('/foo/bar/baz/file.js', '../../bar/rel')).toEqual('/foo/bar/rel');
    });

    //TODO(pk): not sure it is the "right" thing to do, but this test documents how the code works today
    it('should handle corner cases without throwing exceptions', function () {
      expect(normalizePath('/foo/file.js', '../../../../rel')).toEqual('rel');
    });
  });

  describe('path utils', function () {

    it('should provide basename-like utility', function () {
      expect(basename('/dir/file.extension')).toEqual('file.extension');
      expect(basename('/dir/file')).toEqual('file');
      expect(basename('/dir')).toEqual('dir');
      expect(basename('dir')).toEqual('dir');
      expect(basename('')).toEqual('');
    });

    it('should provide dirname-like utility', function () {
      expect(dirname('/dir/sub/file.extension')).toEqual('/dir/sub');
      expect(dirname('/dir/file.extension')).toEqual('/dir');
    });
  });

});