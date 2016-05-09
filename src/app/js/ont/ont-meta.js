(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.ont.contents')
    .directive('ontMeta',     OntMetaDirective)
  ;

  OntMetaDirective.$inject = [];
  function OntMetaDirective() {
    if (debug) console.log("++OntMetaDirective++");
    return {
      restrict:  'E',
      templateUrl: 'js/ont/views/ont-meta.tpl.html',
      controller: OntMetaController,
      scope: {
        meta:     '=',
        editMode: '='
      }
    }
  }

  OntMetaController.$inject = ['$scope', 'metaUtil'];
  function OntMetaController($scope, metaUtil) {
    $scope.debug = debug = debug || $scope.debug;
    if (debug) console.log("++OntMetaController++ $scope=", $scope);

    $scope.sections = metaUtil.sections;
    $scope.visibleSections = _.filter($scope.sections, function(s) {
      return !s.hideForNew && s.predicates && s.predicates.length;
    });
  }

})();
