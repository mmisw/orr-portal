(function() {
'use strict';

angular.module('orrportal.directives', [])

    .directive('orrportalHeader', function() {
        return {
            restrict:    'E',
            templateUrl: 'js/main/views/header.tpl.html'
        }
    })

    .directive('ontgrid', function() {
        return {
            restrict:     'E',
            templateUrl:  'js/ontgrid/views/ontgrid.tpl.html',
            controller:   'OntGridController'
        }
    })

    .directive('orrmain', function() {
        return {
          restrict:     'E',
          templateUrl:  'js/main/views/main.tpl.html',
          controller:   'MainController'
        }
    })

    .directive('orruri', function() {
        return {
          restrict:     'E',
          templateUrl:  'js/uri/views/uri.tpl.html',
          controller:   'UriController'
        }
    })

    .directive('voc', function() {
        return {
            restrict:     'E',
            templateUrl:  'js/voc/views/voc.tpl.html',
            controller:   'VocController'
        }
    })

;

})();
