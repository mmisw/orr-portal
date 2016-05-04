(function() {
  'use strict';

  var debug = true;//appUtil.debug

  angular.module('orrportal.ont.contents', [])
    .directive('ontContents', OntContentsDirective)
    .directive('ontMeta',     OntMetaDirective)
    .directive('ontData',     OntDataDirective)
  ;

  ///////////////////////////////////////////////////

  OntContentsDirective.$inject = [];
  function OntContentsDirective() {
    if (debug) console.log("++OntContentsDirective++");
    return {
      restrict: 'E',
      require:   '^orrOnt',
      templateUrl: 'js/ont/views/ont-contents.tpl.html',
      controller: OntContentsController,
      scope: {
        ontology: '=',
        data:     '='
      }
    }
  }

  OntContentsController.$inject = ['$scope'];
  function OntContentsController($scope) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++OntContentsController++ $scope=", $scope);
  }

  ///////////////////////////////////////////////////

  OntMetaDirective.$inject = [];
  function OntMetaDirective() {
    if (debug) console.log("++OntMetaDirective++");
    return {
      restrict:  'E',
      require:   '^ontContents',
      templateUrl: 'js/ont/views/ont-meta.tpl.html',
      controller: OntMetaController,
      scope: {
        meta: '='
      }
    }
  }

  OntMetaController.$inject = ['$scope'];
  function OntMetaController($scope) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++OntMetaController++ $scope=", $scope);

  }

  ///////////////////////////////////////////////////

  OntDataDirective.$inject = [];
  function OntDataDirective() {
    if (debug) console.log("++OntDataDirective++");
    return {
      restrict:  'E',
      require:   '^ontContents',
      templateUrl: 'js/ont/views/ont-data.tpl.html',
      controller: OntDataController,
      scope: {
        data: '='
      }
    }
  }

  OntDataController.$inject = ['$scope'];
  function OntDataController($scope) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++OntDataController++ $scope=", $scope);
  }

})();
