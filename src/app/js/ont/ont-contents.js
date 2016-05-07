(function() {
  'use strict';

  var debug = appUtil.debug;

  angular.module('orrportal.ont.contents', [
    'orrportal.metaUtil'
  ])
    .directive('ontContents', OntContentsDirective)
    .directive('ontMeta',     OntMetaDirective)
    .directive('ontMetaSection', OntMetaSectionDirective)
    .directive('ontData',     OntDataDirective)
  ;

  ///////////////////////////////////////////////////

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
      templateUrl: 'js/ont/views/ont-meta.tpl.html',
      controller: OntMetaController,
      scope: {
        meta: '=',
        editMode:   '='
      }
    }
  }

  OntMetaController.$inject = ['$scope', 'metaUtil'];
  function OntMetaController($scope, metaUtil) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++OntMetaController++ $scope=", $scope);

    $scope.sections = metaUtil.sections;
  }

  ///////////////////////////////////////////////////

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
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++OntMetaSectionController++ $scope=", $scope);

  }

  ///////////////////////////////////////////////////

  OntDataDirective.$inject = [];
  function OntDataDirective() {
    if (debug) console.log("++OntDataDirective++");
    return {
      restrict:  'E',
      templateUrl: 'js/ont/views/ont-data.tpl.html',
      controller: OntDataController,
      scope: {
        uri:      '=',
        format:   '=',
        data:     '=',
        editMode: '='
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
