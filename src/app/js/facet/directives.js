(function() {
'use strict';

angular.module('orrportal.facet.directives', [])

    .directive('facetselection', function() {
        return {
            restrict:     'E',
            templateUrl:  'js/facet/views/facets.tpl.html',
            controller:   'FacetController'
        }
    })
;

})();
