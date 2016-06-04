var appUtil = (function() {
  'use strict';

  return {
    cleanTripleObject:  cleanTripleObject,

    equalModuloTrailingSlash: equalModuloTrailingSlash
  };

  /*
   * based on htmlifyObject this is to remove/adjust the extra/special characters included
   * in SPARQL responses.
   */
  function cleanTripleObject(value) {
    // uri?
    var m = value.match(/^<([^>]*)>$/);
    if (m) {
      return m[1];
    }

    // \"Age of sea ice\" means...  -->  "Age of sea ice" means...
    value = value.replace(/\\"/g, '"');

    value = value.replace(/^"(.*)"$/, '$1');
    // string with language tag?
    m = value.match(/^("[^"]+")(@[A-Za-z\-]+)$/);
    if (m) {
      // http://stackoverflow.com/questions/7885096/how-do-i-decode-a-string-with-escaped-unicode
      var parsed = JSON.parse(m[1]);
      value = '"' + parsed + '"' + m[2];
    }

    return value
  }

  function equalModuloTrailingSlash(a, b) {
    return a === b || a.replace(/\/+$/, '') === b.replace(/\/+$/, '');
  }

})();

if(typeof exports !== 'undefined') {
  exports.appUtil = appUtil;
}
