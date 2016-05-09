(function() {
  'use strict';

  var debug = appUtil.debug;

  angular.module('orrportal.ont.contents', [
    'orrportal.metaUtil'
  ])
    .directive('ontContents', OntContentsDirective)
  ;

  OntContentsDirective.$inject = [];
  function OntContentsDirective() {
    if (debug) console.log("++OntContentsDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/ont/views/ont-contents.tpl.html',
      controller: OntContentsController,
      scope: {
        ontology: '=',
        data:     '=',
        editMode: '='
      }
    }
  }

  OntContentsController.$inject = ['$scope'];
  function OntContentsController($scope) {
    $scope.debug = debug = debug || $scope.debug;
    if (debug) console.log("++OntContentsController++ $scope=", $scope);
  }

})();
