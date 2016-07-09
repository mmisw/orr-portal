(function() {
  'use strict';

  angular.module('orrportal.facet', ['orrportal.facetModel'])

    .controller('FacetController', FacetController)
    .directive('facetselection', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/facet/facets.html',
        controller:   'FacetController'
      }
    })
  ;

  FacetController.$inject = ['$scope', 'facetModel'];

  function FacetController($scope, facetModel) {
    if (appUtil.debug) console.log("++FacetController++");

    $scope.anyFacetSelection   = facetModel.anyFacetSelection;
    $scope.clearFacetSelection = facetModel.clearFacetSelection;

    // only most recent ontology per owner
    $scope.todo = {mostRecentByOwner: facetModel.getMostRecentByOwner()};

    $scope.getFacetHeight = function(facet) {
      // 1: header + 1 per value
      var nn = 1 + facet.list.length;
      if (facet.key === 'owner') {
        nn += 1;  // for the most recent owner line
      }
      nn += 1;  // some extra space at the end of the box

      if (nn > 8) {  // avoid too high box
        nn = 8;
      }
      return nn + "em";
    };

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

      $scope.$watch('todo.mostRecentByOwner', function() {
        facetModel.setMostRecentByOwner($scope.todo.mostRecentByOwner);
        setScope();
      });
    }

    $scope.$on('evtGotOntologies', function(event, ontologies) {
      //console.log(appUtil.logTs() + ": on gotOntologies");
      facetModel.setOntologies(ontologies);
      setScope();
    });
  }

})();
