(function() {
  'use strict';

  var debug = appUtil.debug;

  angular.module('orrportal.ont.contents')
    .directive('ontMetaSection', OntMetaSectionDirective)
  ;

  OntMetaSectionDirective.$inject = [];
  function OntMetaSectionDirective() {
    if (debug) console.log("++OntMetaSectionDirective++");

    function link(scope, el, attrs, orrOnt) {
      scope.setEditInProgress = function(inProgress) {
        orrOnt.setMetaEditInProgress(inProgress);
      };
      scope.someEditInProgress = function() {
        return orrOnt.someEditInProgress();
      };
    }

    return {
      restrict:  'E',
      require:   '^orrOnt',
      templateUrl: 'js/ont/views/ont-meta-section.tpl.html',
      controller: OntMetaSectionController,
      link: link,
      scope: {
        meta:       '=',
        predicates: '=',
        editMode:   '='
      }
    }
  }

  OntMetaSectionController.$inject = ['$scope'];
  function OntMetaSectionController($scope) {
    $scope.debug = debug = debug || $scope.debug;
    if (debug) console.log("++OntMetaSectionController++ $scope=", $scope);

  }

})();
