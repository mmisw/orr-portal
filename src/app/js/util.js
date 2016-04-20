var appUtil = (function(window) {
    'use strict';

    var windowLocationSearch = parseWindowLocationSearch();
    var uri = windowLocationSearch.uri || uriFromWindowLocation();

    var debug = windowLocationSearch.debug !== undefined
        ? { level: "dummy" }
        : undefined;

    var uriRegex = /\b(https?:\/\/[0-9A-Za-z-\.\/&@:%_\+~#=\?\(\)]+\b)/g;
    // http://stackoverflow.com/q/7885096/830737
    // we could use JSON.parse instead of this regex based conversion
    var escapedUnicodeRegex = /\\u([\d\w]{4})/gi;

    setPolyfills();

    expandOrrOntRest();

    return {
        windowLocationSearch: windowLocationSearch,
        uri:            uri,
        debug:          debug,

        mklink4uriWithSelfHostPrefix: mklink4uriWithSelfHostPrefix,

        mklinks4text:   mklinks4text,

        mklinks4uri:    mklinks4uri,

        htmlifyUri:     htmlifyUri,
        htmlifyObject:  htmlifyObject,

        //getHmac:        getHmac,
        //getHmacParam:   getHmacParam,

        escapeRegex:    escapeRegex,

        logTs: function() { return moment().local().format(); }
    };

    function mklink4uriWithSelfHostPrefix(uri) {
      uri = uri.replace(escapedUnicodeRegex, unescapeEscapedUnicode);
      if (uri.startsWith(getWindowHref())) {
        // it's self-resolvable:
        return '<a href="' + uri + '">' + uri + '</a>';
      }
      else {
        // use "uri" parameter:
        var url4link = uri.replace(/#/g, "%23");
        var orrOntRest = appConfig.orront.rest + "/";
        var href = orrOntRest + "?uri=" + url4link;
        return '<a href="' + href + '">' + uri + '</a>';
      }
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
        var url4link = uri.replace(/#/g, "%23");

        var icon = '<span class="fa fa-external-link xsmall"></span>';
        var link;
        if (onlyExternalLink) {
          //link = '<a target="_blank" href="' + uri + '">' + icon + uri + '</a>';
          link = '<a target="_blank" href="' + uri + '">' + uri + '</a>';
        }
        else {
          link = '<a href="#/uri/' + url4link + '">' + uri + '</a> '
            + '<a target="_blank" title="open directly in a new browser window" href="'
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

    function setPolyfills() {
        /*
         * from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
         */

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

    // http://stackoverflow.com/a/3561711/830737
    function escapeRegex(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    function parseWindowLocationSearch() {
        var locSearch = window.location.search.substring(1);
        var params = {};
        if ( locSearch && locSearch.trim().length > 0 ) {
          // skip ? and get &-separated chunks:
          var chunks = locSearch.split("&");
          _.each(chunks, function(chunk) {
            var toks = _.map(chunk.split("="), decodeURIComponent);
            if ( toks.length > 0 ) {
              var key = toks[0].trim();
              if (key) {
                params[key] = toks.length === 2 ? toks[1].trim() : '';
              }
            }
          });
        }
        if (params.debug !== undefined) console.log("parseWindowLocationSearch: params=", params);
        return params;
    }

    function expandOrrOntRest() {
      var original = appConfig.orront.rest;
      if (original.startsWith("/")) {
        appConfig.orront.rest = getWindowHref() + original.replace(/^\/+/, '');
        console.log("orront.rest expanded to=" + appConfig.orront.rest);
      }
    }

    /**
     * Returns window.location.href without trailing hash part.
     */
    function getWindowHref() {
      var href = window.location.href;
      if (href.endsWith(window.location.hash)) {
        href = href.substring(0, href.length - window.location.hash.length);
      }
      return href;
    }

    /**
     * Returns getWindowHref if it has appConfig.orront.rest as a proper prefix (modulo trailing slash).
     * The returned string can be interpreted as a particular URI request as opposed
     * to a request to the main ontology list page. Otherwise, returns undefined.
     */
    function uriFromWindowLocation() {
      var href = getWindowHref();
      var orrOntRest = appConfig.orront.rest;
      console.log("orrOntRest=" +orrOntRest + " href=" +href);
      if (href.startsWith(orrOntRest) && href.length > orrOntRest.length && orrOntRest+"/" !== href) {
        console.log(orrOntRest + " is proper orrOntRest of href=" +href);
        var uri = href;
      }
      return uri;
    }

})(window);
