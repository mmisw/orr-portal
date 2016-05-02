(function() {
  'use strict';

  angular.module('orrportal.uri.directives', [])
    .directive('orrportalUriViewAsOptions', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/uri/views/uri-viewasoptions.tpl.html'
      }
    })
    .directive('orrportalUriVersions', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/uri/views/uri-versions.tpl.html'
      }
    })
    .directive('orrportalUriTitle', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/uri/views/uri-title.tpl.html'
      }
    })
    .directive('orrportalUriOntTitle', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/uri/views/uri-onttitle.tpl.html'
      }
    })
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
