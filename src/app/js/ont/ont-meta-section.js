(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

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
        ontMeta:    '=',
        predicates: '=',
        editMode:   '='
      }
    }
  }

  OntMetaSectionController.$inject = ['$scope'];
  function OntMetaSectionController($scope) {
    $scope.debug = debug = debug || $scope.debug;
    if (debug) console.log("++OntMetaSectionController++ $scope=", $scope);

    $scope.visiblePredicates = _.filter($scope.predicates, function(p) {
      if ($scope.editMode) {
        return !p.hideForNew;
      }
      else if (p.hideIfUndefined) {
        //console.debug("hideIfUndefined p=", p, $scope.ontMeta[p.uri]);
        return !!$scope.ontMeta[p.uri];
      }
      return true;
    });

  }

})();
