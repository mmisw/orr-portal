(function() {
'use strict';

angular.module('orrportal.directives', [])

    .directive('orrportalHeader', function() {
        return {
            restrict:    'E',
            templateUrl: 'view/header.tpl.html'
        }
    })

    .directive('facetselection', function() {
        return {
            restrict:     'E',
            templateUrl:  'view/facets.tpl.html',
            controller:   'FacetController'
        }
    })

    .directive('ontgrid', function() {
        return {
            restrict:     'E',
            templateUrl:  'view/ontgrid.tpl.html',
            controller:   'OntGridController'
        }
    })

;

})();
