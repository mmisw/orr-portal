(function() {
  'use strict';

  var debug = appUtil.debug;

  angular.module('orrportal.ont.contents', [])
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
      require:   '^orrOnt',
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
      require:   '^ontContents',
      templateUrl: 'js/ont/views/ont-meta.tpl.html',
      controller: OntMetaController,
      scope: {
        meta: '=',
        editMode:   '='
      }
    }
  }

  OntMetaController.$inject = ['$scope'];
  function OntMetaController($scope) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++OntMetaController++ $scope=", $scope);

    $scope.sections = [
      {
        header: "Everything",
        tooltip: "Aja!",
        predicates: ["pred-1", "pred-2"]
      }
    ];

    $scope.$watch("meta", function(meta) {
      if (debug) console.log("watch meta=", meta);
      if (!meta) return;

      var predicates = _.keys(meta);

      // do not show rdf:type owl:Ontology
      var types = meta[vocabulary.rdf.type.uri];
      if (types) {
        types = _.filter(types, function(v) {
          return v !== vocabulary.owl.Ontology.uri;
        });
        if (types.length === 0) {
          predicates = _.filter(predicates, function(p) {
            return p !== vocabulary.rdf.type.uri;
          });
        }
      }
      //console.log("predicates=", predicates);
      $scope.sections[0].predicates = predicates;
    });

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
      require:   '^ontContents',
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
