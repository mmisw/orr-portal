(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.m2r', ['ui.grid.selection'])
    .directive('m2rData',        M2rDataDirective)
    .directive('m2rDataViewer',  M2rDataViewerDirective)
    .directive('m2rDataEditor',  M2rDataEditorDirective)
    .directive('m2rDataEditorMappingSide', M2rDataEditorMappingSideDirective)
    .factory('m2rRelations',     m2rRelations)
    .filter('m2rRelationFilter', m2rRelationFilter)
  ;

  M2rDataDirective.$inject = [];
  function M2rDataDirective() {
    if (debug) console.log("++M2rDataDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/ont/views/m2r-data.tpl.html',
      controller: M2rDataController,
      scope: {
        uri:     '=',
        ontData: '=',
        editMode: '='
      }
    }
  }

  M2rDataController.$inject = ['$scope'];
  function M2rDataController($scope) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++M2rDataController++ $scope=", $scope);
    // ...
  }

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

  M2rDataViewerController.$inject = ['$scope', '$timeout', 'service', 'm2rRelations'];
  function M2rDataViewerController($scope, $timeout, service, m2rRelations) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++M2rDataViewerController++ $scope=", $scope);

    var vm = $scope.vm = {
      uri: $scope.uri,
      mappedOntsInfo: []
    };
    getMappedOntsInfo($scope, $timeout, service, true);

    var triples = getTriples($scope.ontData.mappings, m2rRelations);

    $scope.gridOptions = {
      data: [],
      enableColumnMenus: false,
      columnDefs: []
      ,enableGridMenu: true
      ,showGridFooter: true
      ,enableFiltering: true
    };
    addTripleColumnDefs($scope.gridOptions.columnDefs);

    updateModelArray($scope, $scope.gridOptions.data, triples);
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

  M2rDataEditorController.$inject = ['$scope', '$timeout', 'service', 'm2rRelations'];
  function M2rDataEditorController($scope, $timeout, service, m2rRelations) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++M2rDataEditorController++ $scope=", $scope);

    var vm = $scope.vm = {
      uri: $scope.uri,
      mappedOntsInfo: {}
    };

    getMappedOntsInfo($scope, $timeout, service, false);

    var triples = getTriples($scope.ontData.mappings, m2rRelations);

    $scope.gridOptions = {
      data: [],
      enableColumnMenus: false,
      columnDefs: []
      ,enableGridMenu: true
      ,showGridFooter: true
      ,enableFiltering: true
    };
    addTripleColumnDefs($scope.gridOptions.columnDefs);

    updateModelArray($scope, $scope.gridOptions.data, triples);

    $scope.addMappedOntology = function() {
      console.debug("addMappedOntology");
    };

    $scope.relations = m2rRelations.relations;
  }

  ///////////////////////////////////////////////////////

  M2rDataEditorMappingSideDirective.$inject = [];
  function M2rDataEditorMappingSideDirective() {
    if (debug) console.log("++M2rDataEditorMappingSideDirective++");

    return {
      restrict: 'E',
      templateUrl: 'js/ont/views/m2r-data-editor-mapping-side.tpl.html',
      controller: M2rDataEditorMappingSideController,
      scope: {
        side:            '=',
        mappedOntsInfo:  '='
      }
    };
  }

  M2rDataEditorMappingSideController.$inject = ['$scope'];
  function M2rDataEditorMappingSideController($scope) {
    var vm = $scope.vm = {
      ontsToSearch: _.map($scope.mappedOntsInfo, function() { return 0 }),
      subjects: []
    };

    var template =
      '<div class="ui-grid-cell-contents">' +
      '<span ng-bind-html="row.entity[col.field] | mklinksOnlyExternal"></span>'
      + '</div>';

    $scope.gridOptions = {
      data: 'vm.subjects',
      enableSelectAll: false,
      enableColumnMenus: false,
      columnDefs: [
        {
          field: 'subjectUri',
          displayName: '',
          filter: {
            placeholder: 'type to filter...'
          },
          cellTemplate: template
        }
      ]
      ,enableGridMenu: true
      ,showGridFooter: true
      ,enableFiltering: true
    };

    $scope.$watchCollection("vm.ontsToSearch", updateSubjects);

    function updateSubjects() {
      //console.debug("updateSubjects: ontsToSearch=", vm.ontsToSearch);
      var subjects = [];
      _.each(vm.ontsToSearch, function(sel, index) {
        if (sel) {
          var moi = $scope.mappedOntsInfo[index];
          _.each(moi.subjects, function(subjectAttributes, subjectUri) {
            subjects.push({
              subjectUri:          subjectUri,
              subjectAttributes:   subjectAttributes
            });
          })
        }
      });
      subjects = _.sortBy(subjects, "subjectUri");
      $scope.vm.subjects = [];
      updateModelArray($scope, $scope.vm.subjects, subjects);
    }
  }

  ///////////////////////////////////////////////////////

  m2rRelationFilter.$inject = ['m2rRelations'];
  function m2rRelationFilter(m2rRelations) {
    return function(predicateUri) {
      var rel = m2rRelations.relations[predicateUri];
      return rel && rel.icon ? rel.icon : '?';
    }
  }

  m2rRelations.$inject = ['vocabulary'];
  function m2rRelations(vocabulary) {
    var relations = {};
    function add(prop, sym) {
      relations[prop.uri] = {
        symbol: sym,
        icon: '<i class="m2rRelSymbol">' +sym+ '</i>',
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

    return {
      relations:           relations,
      getRelationTooltip:  getRelationTooltip
    };

    function getRelationTooltip(predicateUri) {
      console.log("getRelationTooltip: predicateUri=", predicateUri);
      var rel = relations[predicateUri];
      return rel.prop.prefix + ':' + rel.prop.label + ' - ' + rel.prop.tooltip;
    }
  }

  function getTriples(ontDataMappings, m2rRelations) {
    var triples = [];
    _.each(ontDataMappings, function(mapGroup) {
      var predicate = mapGroup.predicate;
      _.each(mapGroup.subjects, function(subjectUri) {
        _.each(mapGroup.objects, function(objectUri) {
          triples.push({
            subjectUri:        subjectUri,
            predicateUri:      predicate,
            predicateTooltip:  m2rRelations.getRelationTooltip(predicate),
            objectUri:         objectUri
          })
        });
      });
    });
    return _.sortBy(triples, "subjectUri");
  }

  function updateModelArray($scope, data, triples) {
    appUtil.updateModelArray(data, triples,
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

  function getMappedOntsInfo($scope, $timeout, service, onlyBasicInfo) {
    var mappedOntsInfo = $scope.vm.mappedOntsInfo = [];
    _.each($scope.ontData.mappedOnts, function(ontUri) {
      mappedOntsInfo.push({
        uri: ontUri,
        loading: true
      });
    });

    $timeout(function () {
      _.each(mappedOntsInfo, function(moi) {
        if (onlyBasicInfo) {
          service.refreshOntology(moi.uri, function (error, ontology) {
            moi.loading = false;
            if (error) {   // just log warning
              console.warn("error getting info for mapped ontology " + moi.uri, error);
            }
            else {
              console.debug("got mapped ontology info", ontology);
              moi.name    = ontology.name;
              moi.version = ontology.version;
            }
          });
        }
        else {
          service.getOntologySubjects(moi.uri, function(error, osr) {
            moi.loading = false;
            if (error) {   // just log warning
              console.warn("error getting info for mapped ontology "+moi.uri, error);
            }
            else {
              console.debug("got mapped ontology info", osr);
              moi.name     = osr.name;
              moi.version  = osr.version;
              moi.subjects = osr.subjects;
            }
          });
        }
      });
    });
  }

  function addTripleColumnDefs(columnDefs) {
    columnDefs.push({
      field: 'subjectUri',
      //width: '****',
      displayName: 'Subject',
      headerCellClass: 'right',
      cellTemplate: subjectTemplate
    });

    columnDefs.push({
      field: 'predicateUri',
      maxWidth: 42,
      displayName: 'Prd', //'Predicate',
      headerCellClass: 'm2rRelHeader',
      enableFiltering: false,
      enableSorting: false,
      enableHiding: false,
      cellTemplate: predicateTemplate
    });

    columnDefs.push({
      field: 'objectUri',
      //width: '*****',
      displayName: 'Object',
      headerCellClass: 'left',
      cellTemplate: objectTemplate
    });
  }

  // TODO proper filtering; for now all links external

  var subjectTemplate =
    '<div class="ui-grid-cell-contents right">' +
    '<span ng-bind-html="row.entity[col.field] | mklinksOnlyExternal"></span>'
    + '</div>';

  var predicateTemplate =
    '<div uib-popover="{{ row.entity.predicateTooltip }}" popover-placement="top" popover-append-to-body="true" popover-trigger="mouseenter">' +
     '<div class="ui-grid-cell-contents center">' +
       '<span ng-bind-html="row.entity[col.field] | m2rRelationFilter">' +
     '</span>' +
    '</div>';

  var objectTemplate =
    '<div class="ui-grid-cell-contents left">' +
    '<span ng-bind-html="row.entity[col.field] | mklinksOnlyExternal"></span>'
    + '</div>';

})();
