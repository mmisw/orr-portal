(function() {
  'use strict';

  angular.module('orrportal.filters', [])

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

    .filter('mkMarks', [function() {
      return function(entity) {
        var prefix = '';
        if ('testing' === entity.status) {
          prefix = '<span class="testing">(T)</span>'
        }

        return prefix + appUtil.mklinks4text(entity.name);
      }
    }])

    .filter('mkOrgLink', [function() {
      return function(orgName) {
        return '<a href="#/org/' + orgName + '">' + orgName + '</a>';
      }
    }])

    .filter('mkUserLink', [function() {
      return function(userName) {
        return '<a href="#/user/' + userName + '">' + userName + '</a>';
      }
    }])

  ;

})();
