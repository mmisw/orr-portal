(function() {
  'use strict';

  angular.module('orrportal.uri.directives', [])
    .directive('orrportalUriMetadata', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/uri/views/uri-metadata.tpl.html'
      }
    })
    .directive('orrportalUriContents', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/uri/views/uri-contents.tpl.html'
      }
    })
  ;

})();
