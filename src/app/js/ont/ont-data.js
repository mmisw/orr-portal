(function() {
  'use strict';

  var debug = appUtil.debug;

  angular.module('orrportal.ont.contents')
    .directive('ontData',     OntDataDirective)
  ;

  OntDataDirective.$inject = [];
  function OntDataDirective() {
    if (debug) console.log("++OntDataDirective++");
    return {
      restrict:  'E',
      templateUrl: 'js/ont/views/ont-data.tpl.html',
      controller: OntDataController,
      scope: {
        uri:      '=',
        data:     '=',
        ontDataFormat: '=',
        editMode: '='
      }
    }
  }

  OntDataController.$inject = ['$scope'];
  function OntDataController($scope) {
    $scope.debug = debug = debug || $scope.debug;
    if (debug) console.log("++OntDataController++ $scope=", $scope);
  }

})();
