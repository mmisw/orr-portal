(function() {
  'use strict';

  var debug = true;//appUtil.debug;

  angular.module('orrportal.m2r', [])
    .directive('m2rDataViewer',  M2rDataViewerDirective)
    .directive('m2rDataEditor',  M2rDataEditorDirective)
    .factory('m2rRelations',    m2rRelations)
    .filter('m2rRelationFilter', m2rRelationFilter)
  ;

  M2rDataViewerDirective.$inject = [];
  function M2rDataViewerDirective() {
    if (debug) console.log("++M2rDataViewerDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/ont/views/m2r-data-viewer.tpl.html',
      controller: M2rDataViewerController,
      scope: {
        uri:     '=',
        ontData: '='
      }
    }
  }

  M2rDataViewerController.$inject = ['$scope', '$window'];
  function M2rDataViewerController($scope, $window) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++M2rDataViewerController++ $scope=", $scope);

    var vm = $scope.vm = {
      uri: $scope.uri
    };

    var triples = [];
    _.each($scope.ontData.mappings, function(mapGroup) {
      var predicate = mapGroup.predicate;
      _.each(mapGroup.subjects, function(subjectUri) {
        _.each(mapGroup.objects, function(objectUri) {
          triples.push({
            subjectUri:    subjectUri,
            predicateUri:  predicate,
            objectUri:     objectUri
          })
        });
      });
    });
    triples = _.sortBy(triples, "subjectUri");

    // TODO proper filtering; for now all links external

    var subjectTemplate =
      '<div class="ui-grid-cell-contents right">' +
      '<span ng-bind-html="row.entity[col.field] | mklinksOnlyExternal"></span>'
      + '</div>';

    var predicateTemplate =
      '<div class="ui-grid-cell-contents center">' +
      '<span ng-bind-html="row.entity[col.field] | m2rRelationFilter"></span>'
      + '</div>';

    var objectTemplate =
      '<div class="ui-grid-cell-contents left">' +
      '<span ng-bind-html="row.entity[col.field] | mklinksOnlyExternal"></span>'
      + '</div>';

    $scope.gridOptions = {
      data: [],
      columnDefs: [
        {
          field: 'subjectUri',
          width: '****',
          displayName: '', //'Subject',
          grouping: { groupPriority: 0 },
          cellTemplate: subjectTemplate
        },
        {
          field: 'predicateUri',
          width: 50,
          displayName: '', //'Predicate',
          cellTemplate: predicateTemplate
        },
        {
          field: 'objectUri',
          width: '*****',
          displayName: '', //'Object',
          cellTemplate: objectTemplate
        }
      ]
      ,enableGridMenu: true
      ,showGridFooter: true
      ,enableFiltering: true
    };

    appUtil.updateModelArray($scope.gridOptions.data, triples,
      function(done) {
        if (done) {
          $scope.$parent.$digest();
        }
        else {
          $scope.$digest();
        }
      },
      300
    );
  }

  ///////////////////////////////////////////////////////

  M2rDataEditorDirective.$inject = [];
  function M2rDataEditorDirective() {
    if (debug) console.log("++M2rDataEditorDirective++");

    function link(scope, el, attrs, orrOnt) {
      scope.setEditInProgress = function(inProgress) {
        orrOnt.setDataEditInProgress(inProgress);
      };
      scope.someEditInProgress = function() {
        return orrOnt.someEditInProgress();
      };
    }

    return {
      restrict: 'E',
      require:  '^orrOnt',
      templateUrl: 'js/ont/views/m2r-data-editor.tpl.html',
      controller: M2rDataEditorController,
      link: link,
      scope: {
        uri:     '=',
        ontData: '='
      }
    };
  }

  M2rDataEditorController.$inject = ['$scope', '$uibModal', '$filter', '$timeout', 'utl'];
  function M2rDataEditorController($scope, $uibModal, $filter, $timeout, utl) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++M2rDataEditorController++ $scope=", $scope);

    var vm = $scope.vm = {
      uri: $scope.uri
    };
  }

  m2rRelationFilter.$inject = ['m2rRelations'];
  function m2rRelationFilter(m2rRelations) {
    return function(predicateUri) {
      var rel = m2rRelations[predicateUri];
      var icon = rel && rel.icon ? rel.icon : '?';
      var tooltip = rel.prop.prefix + ':' + rel.prop.label;
      if (rel.prop.tooltip) tooltip += ": " + rel.prop.tooltip;
      return '<i title="' +tooltip+ '">' +icon+ '</i>';
    }
  }

  m2rRelations.$inject = ['vocabulary'];
  function m2rRelations(vocabulary) {
    var relations = {};
    function add(prop, sym) {
      relations[prop.uri] = {
        icon: '<i class="m2rRelSymbol btn btn-default btn-xs">' +sym+ '</i>',
        prop: prop
      };
    }
    var skos = vocabulary.skos;
    var owl = vocabulary.owl;
    add(skos.exactMatch,   '=');
    add(skos.closeMatch,   '&asymp;');
    add(skos.broadMatch,   '&lt;');
    add(skos.narrowMatch,  '&gt;');
    add(skos.relatedMatch, '&sim;');
    add(owl.sameAs,        '&equiv;');

    return relations;
  }
})();
