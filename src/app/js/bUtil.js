// some basic utilities
var bUtil = (function() {
  'use strict';

  setPolyfills();

  return {
    equalModuloTrailingSlash: function(a, b) {
      return a === b || a.replace(/\/+$/, '') === b.replace(/\/+$/, '');
    },

    // http://stackoverflow.com/a/3561711/830737
    escapeRegex: function escapeRegex(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    },

    /**
     * Returns a copy of the given element except that any traversed
     * dictionary will only have the keys passing the given predicate `goodKey`.
     */
    filterKeys: function (obj, goodKey) {
      return doIt(obj);

      function doIt(obj) {
        if (_.isPlainObject(obj)) {
          var res = {};
          _.each(obj, function(val, key) {
            if (goodKey(key)) {
              res[key] = doIt(val);
            }
          });
          return res;
        }
        else if (_.isArray(obj)) {
          return _.map(obj, doIt);
        }
        else return obj;
      }
    },

    /**
     * Introduced to help with determination of URI self-dispatch.
     * Considers https==http for purposes of URI identification.
     */
    uriEqualOrHasPrefixWithSlash: function(uri, prefix) {
      var normalizedPrefix = prefix.replace(/\/+$/, '') + '/'; // only one trailing slash.
      function baseCheck(u) {
        return u === prefix || u.startsWith(normalizedPrefix);
      }
      if (baseCheck(uri)) {
        return true;
      }
      else {
        var uri2 = bUtil.replaceHttpScheme(uri);
        return uri2 && baseCheck(uri2);
      }
    },

    /**
     * If url starts with "http:" or "https:", returns the same url but with the scheme replaced for the other.
     * Otherwise, undefined.
     */
    replaceHttpScheme: function (url) {
      if      (url.startsWith("http:"))  return "https:" + url.substring("http:".length)
      else if (url.startsWith("https:")) return "http:" +  url.substring("https:".length)
    }
  };

  // from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
  function setPolyfills() {
    if (!String.prototype.startsWith) {
      Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(searchString, position) {
          position = position || 0;
          return this.lastIndexOf(searchString, position) === position;
        }
      });
    }

    if (!String.prototype.endsWith) {
      Object.defineProperty(String.prototype, 'endsWith', {
        value: function(searchString, position) {
          var subjectString = this.toString();
          if (position === undefined || position > subjectString.length) {
            position = subjectString.length;
          }
          position -= searchString.length;
          var lastIndex = subjectString.indexOf(searchString, position);
          return lastIndex !== -1 && lastIndex === position;
        }
      });
    }
  }

})();
