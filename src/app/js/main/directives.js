(function() {
'use strict';

angular.module('orrportal.directives', [])

    .directive('orrportalHeader', function() {
        return {
            restrict:    'E',
            templateUrl: 'js/main/header.html'
        }
    })

    .directive('orrportalLogButton', function() {
        return {
            restrict:    'E',
            templateUrl: 'js/fireauth/views/button.tpl.html',
            controller:   'MainLoginController'
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
;

})();
