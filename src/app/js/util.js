var appUtil = (function(window) {
    'use strict';

    var debug = window && window.location.toString().match(/.*\?debug/)
        ? { level: "dummy" }
        : undefined;

    var uriRegex = /\b(https?:\/\/[0-9A-Za-z-\.\/&@:%_\+~#=\?\(\)]+\b)/g;
    // http://stackoverflow.com/q/7885096/830737
    // we could use JSON.parse instead of this regex based conversion
    var escapedUnicodeRegex = /\\u([\d\w]{4})/gi;

    setPolyfills();

    return {
        debug:          debug,
        mklinks4text:   mklinks4text,

        htmlifyUri:     htmlifyUri,
        htmlifyObject:  htmlifyObject,

        getHmac:        getHmac,
        getHmacParam:   getHmacParam,

        logTs: function() { return moment().local().format(); }
    };

    function htmlifyUri(uri) {
        return mklinks4uri(uri, true);
    }

    function htmlifyObject(value) {
        if (/^<([^>]*)>$/.test(value)) {
            // it is an uri.
            value = mklinks4uri(value, true);
        }
        else {
            // \"Age of sea ice\" means...  -->  "Age of sea ice" means...
            value = value.replace(/\\"/g, '"');

            value = value.replace(/^"(.*)"$/, '$1');
            // string with language tag?
            var m = value.match(/^("[^"]+")(@[A-Za-z\-]+)$/);
            if (m) {
                // http://stackoverflow.com/questions/7885096/how-do-i-decode-a-string-with-escaped-unicode
                value = '"' + decodeURIComponent(JSON.parse(m[1])) + '"' + m[2];
            }
            else {
                value = mklinks4text(value);
                value = value.replace(escapedUnicodeRegex, unescapeEscapedUnicode);
            }
        }
        return value
    }

    function n2br(str) {
        str = str.replace(/\\n/g, "\n");
        str = str.replace(/\n/g, "<br />\n");
        return str;
    }

    function mklinks4uri(uri, possibleBrackets) {
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
        var link = '<a href="#/uri/' + url4link + '">' + uri + '</a> '
            + '<a class="fa fa-external-link" target="_blank" title="open directly in a new browser window" href="' + uri + '"></a>'
            ;

        //console.log("mklinks4uri:" +pre + "|" + link + "|" +post);
        return pre + link + post;
    }

    function mklinks4uriNoBrackets(uri) {
        return mklinks4uri(uri);
    }

    function mklinks4text(str) {
        // first, escape original text
        str = _.escape(str);
        // but restore any '&' for the links processing below:
        str = str.replace(/&amp;/g, "&");
        // then, add our re-formatting
        str = n2br(str);
        str = str.replace(uriRegex, mklinks4uriNoBrackets);
        return str;
    }

    function unescapeEscapedUnicode(escaped, val) {
        return String.fromCharCode(parseInt(val, 16));
    }

    function getHmac(str) {
        var shaObj = new jsSHA(str, "TEXT");
        return shaObj.getHMAC(appConfig.orront.secret, "TEXT", "SHA-1", "B64");
    }

    function getHmacParam(str) {
        return appConfig.orront.sigParamName + "=" + encodeURIComponent(getHmac(str));
    }

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

})(window);
