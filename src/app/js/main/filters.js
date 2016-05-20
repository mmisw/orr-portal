(function() {
  'use strict';

  angular.module('orrportal.filters', [])

    .filter('mklink4uriWithSelfHostPrefix', [function() {
      return function(text) {
        return appUtil.mklink4uriWithSelfHostPrefix(text);
      }
    }])

    .filter('mklink4uriAlwaysUriParameter', [function() {
      return function(text) {
        return appUtil.mklink4uriAlwaysUriParameter(text);
      }
    }])

    .filter('mklinks', [function() {
      return function(text) {
        return appUtil.mklinks4text(text);
      }
    }])

    // todo: instead of this, use mklinks with parameter
    .filter('mklinksOnlyExternal', [function() {
      return function(text) {
        return appUtil.mklinks4text(text, true);
      }
    }])

    .filter('propValueFilter', ['vocabulary', function(vocabulary) {
      return function(value, prop) {
        var predicate = prop.predicate ? prop.predicate : prop;

        if (vocabulary.omv.keywords.uri === predicate) {
          return prepareKeywords(value);
        }
        if (vocabulary.omvmmi.origMaintainerCode.uri === predicate) {
          if (value) {
            return '<a href="#/org/' +value+ '">'+ value+ '</a>';
          }
        }
        else return appUtil.mklinks4text(value, true);

        function prepareKeywords(keywords) {
          if (keywords) {
            keywords = keywords.replace(/"/g, ''); // ignore any double quotes
            var list = keywords.split(/,|;/);
            //console.log("prepareKeywords: keywords=", keywords, "list=", list);
            var prepared = _.map(list, function(word) {
              word = word.trim();
              var a = '<a href="#/kw/' +word+ '">'+ word+ '</a>';
              return'<span class="btn btn-link btn-sm badge kwLink">' + a + '</span>'
            });
            return prepared.join(" ");
          }
        }
      }
    }])

    .filter('mkMarks', [function() {
      return function(entity) {
        var prefix = '';
        if ('testing' === entity.status) {
          prefix = '<span class="testing">(T)</span>'
        }

        return prefix + appUtil.mklinks4text(entity.name);
      }
    }])

    .filter('mkOwnerLink', [function() {
      return ownerLink;
    }])

    .filter('mkOrgLink', [function() {
      return orgLink;
    }])

    .filter('mkUserLink', [function() {
      return userLink;
    }])
  ;

  function ownerLink(ownerName) {
    if (ownerName.startsWith("~"))
      return userLink(ownerName.substring(1));
    else
      return orgLink(ownerName);
  }

  function orgLink(orgName) {
    return '<a class="ownerLink" href="#/org/' + orgName + '">' + orgName + '</a>';
  }

  function userLink(userName) {
    return '<a class="ownerLink" href="#/user/' + userName + '">~' + userName + '</a>';
  }

})();
