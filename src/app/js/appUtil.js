var appUtil = (function(window) {
  'use strict';

  var windowHref = getWindowHref();
  var windowBareHref = getBareWindowHref();
  var windowLocationSearch = parseWindowLocationSearch();

  var debug = windowLocationSearch.debug !== undefined
    ? { level: "dummy" }
    : undefined;

  debugWindowLocationRelatedStuff();

  expandOrrOntRest();
  expandPortalMainPageUrl();

  var requestedUri, requestedVersion;
  setRequestedUriAndVersionIfAny();

  /*
   * TODO the whole htmlfying/text-processing/filtering in this module needs revision/simplification
   */

  var uriRegex = /\b(https?:\/\/[0-9A-Za-z-\.\/&@:%_\+~#=\?\(\)]+\b)/g;
  // http://stackoverflow.com/q/7885096/830737
  // we could use JSON.parse instead of this regex based conversion
  var escapedUnicodeRegex = /\\u([\d\w]{4})/gi;

  return {
    debug:          debug,

    windowBareHref: windowBareHref,

    requestedUri:     requestedUri,
    requestedVersion: requestedVersion,

    getHref4uriWithSelfHostPrefix: getHref4uriWithSelfHostPrefix,
    getOntUrlForExternalTool:      getOntUrlForExternalTool,
    mklink4uriWithSelfHostPrefix:  mklink4uriWithSelfHostPrefix,
    mklink4uriAlwaysUriParameter:  mklink4uriAlwaysUriParameter,

    mklinks4text:   mklinks4text,

    mklinks4uri:    mklinks4uri,

    htmlifyUri:     htmlifyUri,
    htmlifyObject:  htmlifyObject,

    cleanTripleObject:  cleanTripleObject,

    //getHmac:        getHmac,
    //getHmacParam:   getHmacParam,

    updateModelArray: updateModelArray,

    logTs: function() { return moment().local().format(); }
  };

  function getHref4uriWithSelfHostPrefix(uri) {
    uri = uri.replace(escapedUnicodeRegex, unescapeEscapedUnicode);

    var prefix = appConfig.portal.mainPage;
    // previously, windowHref

    if (bUtil.uriEqualOrHasPrefixWithSlash(uri, prefix)) {
      // it's self-resolvable:
      return uri;
    }
    else {
      // use 'iri' parameter to prefix:
      var url4link = uri.replace(/#/g, "%23");
      var paramAndValue = "iri=" + url4link;
      if (prefix.indexOf(paramAndValue) < 0) {
        // question mark or ampersand?
        var qa = prefix.indexOf('?') >= 0 ? '&' : '?';
        return prefix + qa + "iri=" + url4link;
      }
      else return prefix;  // already there
    }
  }

  /**
   * This one is directly based on appConfig.orront.rest
   */
  function getOntUrlForExternalTool(uri) {
    uri = uri.replace(escapedUnicodeRegex, unescapeEscapedUnicode);
    if (bUtil.uriEqualOrHasPrefixWithSlash(uri, appConfig.orront.rest)) {
      return uri;  // it's self-resolvable:
    }
    else {
      var url4link = uri.replace(/#/g, "%23");
      // use ".../api/v0/ont?iri=..." with encoded question mark
      return appConfig.orront.rest + "/api/v0/ont%3F" + "iri=" + url4link;
    }
  }

  function mklink4uriWithSelfHostPrefix(uri) {
    var href = getHref4uriWithSelfHostPrefix(uri);
    return '<a class="uriLink" href="' + href + '">' + uri + '</a>';
  }

  function mklink4uriAlwaysUriParameter(uri) {
    uri = uri.replace(escapedUnicodeRegex, unescapeEscapedUnicode);
    var url4link = uri.replace(/#/g, "%23");
    var href = "?iri=" + url4link;
    return '<a class="uriLink" href="' + href + '">' + uri + '</a>';
  }

  function htmlifyUri(uri) {
    return mklinks4uri(uri, true);
  }

  function htmlifyObject(value, onlyExternalLink) {
    if (/^<([^>]*)>$/.test(value)) {
      // it is an uri.
      value = mklinks4uri(value, true, onlyExternalLink);
    }
    else {
      // \"Age of sea ice\" means...  -->  "Age of sea ice" means...
      value = value.replace(/\\"/g, '"');

      value = value.replace(/^"(.*)"$/, '$1');
      // string with language tag?
      var m = value.match(/^("[^"]+")(@[A-Za-z\-]+)$/);
      if (m) {
        // http://stackoverflow.com/questions/7885096/how-do-i-decode-a-string-with-escaped-unicode
        var parsed = JSON.parse(m[1]);
        value = '"' + parsed + '"' + m[2];

        // TODO review the use of decodeURIComponent below because parsed could
        // be a long string, not just a URI component.
        //try {
        //  value = '"' + decodeURIComponent(parsed) + '"' + m[2];
        //}
        //catch(ex) {
        //  console.error(ex, "parsed=", parsed, "m[2]=", m[2]);
        //}
      }
      else {
        value = mklinks4text(value, onlyExternalLink);
        value = value.replace(escapedUnicodeRegex, unescapeEscapedUnicode);
      }
    }
    return value
  }

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

  // newline -> <br/>
  function n2br(str) {
    str = str.replace(/\\n/g, "\n");
    str = str.replace(/\n/g, "<br />\n");
    return str;
  }

  // newline -> <p>..</p>
  function n2p(str) {
    str = str.replace(/\\n/g, "\n");
    var parts = str.split(/\n/);
    if (parts.length > 1) {
      parts = _.map(parts, function(p) { return "<p>" + p + "</p>"; });
      str = parts.join("");
    }
    return str;
  }

  function mklinks4uri(uri, possibleBrackets, onlyExternalLink) {
    //console.log("mklinks4uri: onlyExternalLink=" + onlyExternalLink + " uri=" + uri);
    //console.log("1 URI[" + uri+ "]");
    uri = uri.replace(escapedUnicodeRegex, unescapeEscapedUnicode);
    var pre = "";
    var post = "";
    if (possibleBrackets !== undefined && possibleBrackets) {
      var m = uri.match(/^(<)?([^>]*)(>)?$/);
      pre  = _.escape(m[1]);
      uri  = m[2];
      post = _.escape(m[3]);
    }

    var icon = '<span class="fa fa-external-link xsmall"></span>';
    var link;
    if (onlyExternalLink) {
      //link = '<a target="_blank" rel="noopener" href="' + uri + '">' + icon + uri + '</a>';
      link = '<a class="uriLink" target="_blank" rel="noopener" href="' + uri + '">' + uri + '</a>';
    }
    else {
      var href = getHref4uriWithSelfHostPrefix(uri);
      link = '<a class="uriLink" href="' + href + '">' + uri + '</a> '
        + '<a target="_blank" rel="noopener" title="open directly in a new browser window" href="'
        + uri + '">' +icon+ '</a>'
      ;
    }

    //console.log("mklinks4uri:" +pre + "|" + link + "|" +post);
    return pre + link + post;
  }

  function mklinks4uriNoBrackets(uri) {
    return mklinks4uri(uri);
  }

  function mklinks4uriNoBracketsOnlyExternalLink(uri) {
    return mklinks4uri(uri, false, true);
  }

  function mklinks4text(str, onlyExternalLink) {
    //console.log("mklinks4text: onlyExternalLink=" + onlyExternalLink + " str=" + str);
    // first, escape original text
    str = _.escape(str);
    // but restore any '&' for the links processing below:
    str = str.replace(/&amp;/g, "&");
    str = str.replace(/&gt;/g, ">");
    // then, add our re-formatting
    str = n2p(str);
    str = str.replace(uriRegex, onlyExternalLink ? mklinks4uriNoBracketsOnlyExternalLink : mklinks4uriNoBrackets);
    return str;
  }

  function unescapeEscapedUnicode(escaped, val) {
    return String.fromCharCode(parseInt(val, 16));
  }

  //function getHmac(str) {
  //    var shaObj = new jsSHA(str, "TEXT");
  //    return shaObj.getHMAC(appConfig.orront.secret, "TEXT", "SHA-1", "B64");
  //}
  //
  //function getHmacParam(str) {
  //    return appConfig.orront.sigParamName + "=" + encodeURIComponent(getHmac(str));
  //}

  function setRequestedUriAndVersionIfAny() {
    if (windowLocationSearch.iri || windowLocationSearch.uri) {
      requestedUri     = windowLocationSearch.iri || windowLocationSearch.uri;
      requestedVersion = windowLocationSearch.version;
      console.debug("from window.location.search: requestedUri=" +requestedUri+ " requestedVersion=" + requestedVersion);
    }
    else {
      // uri will be windowBareHref if it has appConfig.portal.mainPage as a proper prefix (modulo trailing slash).
      // This case interpreted as a particular URI request as opposed to a request to the main ontology list page.
      // Otherwise, none of uri and version are defined here.
      var mainPage = appConfig.portal.mainPage;
      console.debug("mainPage=[" +mainPage+ "] windowBareHref=[" +windowBareHref+ "]");
      //if (windowBareHref.startsWith(mainPage) && windowBareHref.length > mainPage.length && mainPage+"/" !== windowBareHref) {
      if (windowBareHref.startsWith(mainPage) && !bUtil.equalModuloTrailingSlash(windowBareHref, mainPage)) {
        console.debug("mainPage is proper prefix of windowBareHref, so using the latter as iri");
        requestedUri     = windowBareHref;
        requestedVersion = windowLocationSearch.version;
      }
      console.debug("from window.location.href: requestedUri=" +requestedUri+ " requestedVersion=" + requestedVersion);
    }
  }

  function parseWindowLocationSearch() {
    return parseForSearchParams(window.location.search);
  }

  function parseForSearchParams(string, params) {
    params = params || {};
    if ( string && string.trim().length > 0 ) {
      string = string.substring(string.indexOf('?') + 1);
      var chunks = string.split("&");
      _.each(chunks, function(chunk) {
        var toks = _.map(chunk.split("="), decodeURIComponent);
        if (toks.length > 0) {
          var key = toks[0].trim();
          if (key) {
            params[key] = toks.length === 2 ? toks[1].trim() : '';
          }
        }
      });
    }
    return params;
  }

  function expandOrrOntRest() {
    var original = appConfig.orront.rest;
    if (original.startsWith("/")) {
      var loc = window.location;
      appConfig.orront.rest = loc.protocol + "//" + loc.host + original;
      if (debug) console.debug("orront.rest expanded to=" + appConfig.orront.rest);
    }
  }

  function expandPortalMainPageUrl() {
    if (!appConfig.portal.mainPage) {
      console.warn("DEV mode: portal.mainPage undefined; setting to windowBareHref=", windowBareHref);
      appConfig.portal.mainPage = windowBareHref;
    }
    var original = appConfig.portal.mainPage;
    if (original.startsWith("//")) {
      var loc = window.location;
      appConfig.portal.mainPage = loc.protocol + original;
      if (debug) console.debug("portal.mainPage expanded to=" + appConfig.portal.mainPage);
    }
  }

  /**
   * Returns window.location.href without trailing hash part (but possibly with search part)
   */
  function getWindowHref() {
    var href = window.location.href;
    var hash = window.location.hash;
    if (!hash) {
      // hash may be empty when there's a bare trailing '#' in href
      href = href.replace(/#+$/, '');
    }
    if (href.endsWith(hash)) {
      href = href.substring(0, href.length - hash.length);
    }
    return href;
  }

  /**
   * Returns window.location.href without anything starting with search part (if any)
   * and no trailing slash.
   * If no search part, returns the same as getWindowHref but without trailing slash.
   * This was mainly introduced to facilitate local development.
   */
  function getBareWindowHref() {
    var result = window.location.href;
    var search = window.location.search;
    if (search) {
      result = result.substring(0, result.indexOf(search));
    }
    else {
      result = windowHref;
    }
    return result.replace(/\/+$/, '');
  }

  /**
   * Helps perform updates to a view-model array with potential better UI responsiveness
   * and/or visual feedback.
   *
   * @param targetArray    Destination array.
   * @param sourceArray    Source array. It's assumed this array doesn't change during the transfer.
   * @param stepFn         stepFn(done) called at every chunk update, with
   *                       done indicating whether the update has been completed.
   *                       If not complete, this function should return true to stop the transfer.
   * @param doPush         Elements are pushed to the target array unless this parameter is defined and falsy
   * @param chunkSize      the larger this value the less responsive the ui.
   */
  function updateModelArray(targetArray, sourceArray, stepFn, chunkSize, doPush) {
    chunkSize = chunkSize || 5;
    doPush = doPush === undefined ? true : doPush;
    var jj = 0, len = sourceArray.length;
    setTimeout(function () {
      function processNext() {
        for (var kk = 0; jj < len && kk < chunkSize; kk++, jj++) {
          if (doPush)
            targetArray.push(sourceArray[jj]);
          else
            targetArray.unshift(sourceArray[jj]);
        }

        var done = jj >= len;
        var stop = stepFn(done);

        if (!done && !stop) {
          setTimeout(processNext, 0);
        }
      }
      processNext();
    }, 0);
  }

  function debugWindowLocationRelatedStuff() {
    var href = window.location.href;
    var hash = window.location.hash;
    var search = window.location.search;
    console.debug("window.location: href=[" + href + "] hash=[" + hash + "] search=[" + search + "]");

    console.debug("windowHref=          [" +windowHref+ "]");
    console.debug("windowBareHref=      [" +windowBareHref+ "]");
    console.debug("windowLocationSearch=", windowLocationSearch);
  }

})(window);
