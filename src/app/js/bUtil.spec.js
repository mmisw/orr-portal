'use strict';

describe('bUtil', function() {
  describe('#equalModuloTrailingSlash', function () {
    it('should be true with exact strings', function () {
      expect(bUtil.equalModuloTrailingSlash('', '')).toEqual(true);
      expect(bUtil.equalModuloTrailingSlash('http://foo.bar/', 'http://foo.bar/')).toEqual(true);
    });
    it('should be true with strings differing only with trailing slash', function () {
      expect(bUtil.equalModuloTrailingSlash('/', '')).toEqual(true);
      expect(bUtil.equalModuloTrailingSlash('', '/')).toEqual(true);
      expect(bUtil.equalModuloTrailingSlash('foo/', 'foo')).toEqual(true);
      expect(bUtil.equalModuloTrailingSlash('foo', 'foo/')).toEqual(true);
    });
  });

  describe('#filterKeys', function () {
    function goodKey(key) { return !key.startsWith('_') }
    function doIt(obj) { return bUtil.filterKeys(obj, goodKey) }

    it('should return original object with all good keys', function () {
      expect(doIt(undefined)).toEqual(undefined);
      expect(doIt(0)).toEqual(0);
      expect(doIt({})).toEqual({});
      expect(doIt({a:1, b:'foo', c:{d:2}})).toEqual({a:1, b:'foo', c:{d:2}});
    });
    it('should remove unwanted keys', function () {
      expect(doIt({_x: 1})).toEqual({});
      expect(doIt([0, {_x: 1, y:3}, 9])).toEqual([0, {y:3}, 9]);
      expect(doIt({a:1, _x:'foo', c:{d:2,_e:4}})).toEqual({a:1, c:{d:2}});
    });
  });

  describe('#uriEqualOrHasPrefixWithSlash', function () {
    it('should be true with equal strings', function () {
      expect(bUtil.uriEqualOrHasPrefixWithSlash("", "")).toEqual(true);
      expect(bUtil.uriEqualOrHasPrefixWithSlash("http://ex3", "http://ex3")).toEqual(true);
    });
    it('should be false when not even a prefix', function () {
      expect(bUtil.uriEqualOrHasPrefixWithSlash("http://ex3", "http://ex/")).toEqual(false);
      expect(bUtil.uriEqualOrHasPrefixWithSlash("http://ex3", "foo")).toEqual(false);
    });
    it('should be false with prefix but no slash boundary', function () {
      expect(bUtil.uriEqualOrHasPrefixWithSlash("http://ex3", "http://ex")).toEqual(false);
      expect(bUtil.uriEqualOrHasPrefixWithSlash("http://ex-", "http://ex")).toEqual(false);
    });
  });
});
