(function() {
'use strict';

angular.module('orrportal.facet', ['orrportal.facet.directives', 'orrportal.facetModel'])

    .controller('FacetController', FacetController)
;

FacetController.$inject = ['$scope', 'facetModel'];

function FacetController($scope, facetModel) {
    if (appUtil.debug) console.log("++FacetController++");

    $scope.anyFacetSelection   = facetModel.anyFacetSelection;
    $scope.clearFacetSelection = facetModel.clearFacetSelection;

    // only most recent ontology per organization
    $scope.todo = {mostRecentByOrg: facetModel.getMostRecentByOrg()};

    setScope();
    setWatchers();

    function setScope() {
        $scope.ontologies = facetModel.getOntologies();
        $scope.facetArray = facetModel.getFacetArray();
        $scope.facets     = facetModel.getFacets();
    }

    function setWatchers() {
        $scope.$watch('facets', function() {
            //console.log(appUtil.logTs() + ": $watch facets");
            facetModel.refreshFacets();
            setScope();
        }, true);

        $scope.$watch('todo.mostRecentByOrg', function() {
            facetModel.setMostRecentByOrg($scope.todo.mostRecentByOrg);
            setScope();
        });
    }

    $scope.$on('gotOntologies', function(event, ontologies) {
        //console.log(appUtil.logTs() + ": on gotOntologies");
        facetModel.setOntologies(ontologies);
        setScope();
    });
}

})();
