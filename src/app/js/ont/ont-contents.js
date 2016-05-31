(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.ont.contents', [
    'orrportal.metaUtil', 'orrportal.rj-viewer'
  ])
    .directive('ontContents', OntContentsDirective)
  ;

  OntContentsDirective.$inject = [];
  function OntContentsDirective() {
    if (debug) console.log("++OntContentsDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/ont/ont-contents.html',
      controller: OntContentsController,
      scope: {
        ontology:      '=',
        ontData:       '=',
        ontDataFormat: '=',
        editMode:      '='
      }
    }
  }

  OntContentsController.$inject = ['$scope'];
  function OntContentsController($scope) {
    $scope.debug = debug = debug || $scope.debug;
    if (debug) console.log("++OntContentsController++ $scope=", $scope);
  }

})();
