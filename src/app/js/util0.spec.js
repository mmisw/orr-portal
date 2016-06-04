'use strict';

describe('appUtil', function() {
  describe('#equalModuloTrailingSlash()', function () {
    it('should be true with exact strings', function () {
      expect(appUtil.equalModuloTrailingSlash('', '')).toEqual(true);
      expect(appUtil.equalModuloTrailingSlash('', '')).toEqual(true);
    });
    it('should be true with strings differing only with trailing slash', function () {
      expect(appUtil.equalModuloTrailingSlash('/', '')).toEqual(true);
      expect(appUtil.equalModuloTrailingSlash('', '/')).toEqual(true);
      expect(appUtil.equalModuloTrailingSlash('foo/', 'foo')).toEqual(true);
      expect(appUtil.equalModuloTrailingSlash('foo', 'foo/')).toEqual(true);
    });
  });
});
