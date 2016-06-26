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
      templateUrl: 'js/ont/m2r/m2r-data.html',
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
      templateUrl: 'js/ont/m2r/m2r-data-viewer.html',
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

    $scope.vm = {
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
      templateUrl: 'js/ont/m2r/m2r-data-editor.html',
      controller: M2rDataEditorController,
      link: link,
      scope: {
        uri:     '=',
        ontData: '='
      }
    };
  }

  M2rDataEditorController.$inject = ['$scope', '$timeout', '$uibModal', 'service', 'm2rRelations', 'utl'];
  function M2rDataEditorController($scope, $timeout, $uibModal, service, m2rRelations, utl) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++M2rDataEditorController++ $scope=", $scope);

    var vm = $scope.vm = {
      uri: $scope.uri,
      mappedOntsInfo: {},
      selectableOnts: [],
      selectedRowsLeft:  [],
      selectedRowsRight: []
    };

    getMappedOntsInfo($scope, $timeout, service, false);

    var triples = getTriples($scope.ontData.mappings, m2rRelations);

    $scope.gridOptions = {
      data: [],
      enableColumnMenus: false,
      columnDefs: []
      ,enableGridMenu: false
      ,showGridFooter: true
      ,enableFiltering: true
    };
    addTripleColumnDefs($scope.gridOptions.columnDefs);

    updateModelArray($scope, $scope.gridOptions.data, triples);

    $scope.relations = m2rRelations.relations;

    $scope.selectMappedOntology = function(ont) {
      //console.debug("selectMappedOntology: ont=", ont);
      $scope.ontData.mappedOnts.push(ont.uri);
      var moi = {
        uri:      ont.uri,
        subjects: ont.subjects
      };
      $scope.vm.mappedOntsInfo.push(moi);
      getOntologySubjects(moi, service);
      updateSelectableOntUris($scope, service);
    };

    $scope.enterExternalOntologyUri = function() {
      //console.debug("enterExternalOntologyUri");
      var modalInstance = $uibModal.open({
        templateUrl:  'js/ont/m2r/m2r-data-editor-ext-ont.html',
        controller:   EnterExternalOntologyUriController,
        backdrop:    'static',
        resolve: {
          info: function () {
            return {
              ontUris: $scope.ontData.mappedOnts
            }
          }
        }
      });
      modalInstance.result.then(function(ont) {
        if (debug) console.debug("enterExternalOntologyUri: ont=", ont);
        $scope.ontData.mappedOnts.push(ont.uri);
        var moi = {
          uri:      ont.uri,
          subjects: ont.subjects
        };
        $scope.vm.mappedOntsInfo.push(moi);
        updateSelectableOntUris($scope, service);
      });
    };

    $scope.noSelectedPairs = function() {
      return vm.selectedRowsLeft.length === 0 || vm.selectedRowsRight.length === 0;
    };
    $scope.relButtonClicked = function(rel) {
      console.debug("relButtonClicked: rel=", rel
        ,"selectedRowsLeft=", vm.selectedRowsLeft.length
        ,"selectedRowsRight=", vm.selectedRowsRight.length
      );

      // TODO remove any redundant triples (both data model and grid).

      var numNewMappings = vm.selectedRowsLeft.length * vm.selectedRowsRight.length;

      if (numNewMappings >= 20) {
        utl.confirm({
          message: '<div class="center">' +
            numNewMappings + ' mappings are about to be added.' +
            '<br><br>' +
            'Proceed?' +
          '</div>',
          ok: doAddMappings
        });
      }
      else doAddMappings();

      function doAddMappings() {
        var predicate = rel.prop.uri;

        // update data mappings:
        $scope.ontData.mappings.push({
          subjects:   _.map(vm.selectedRowsLeft, "subjectUri"),
          predicate:  predicate,
          objects:    _.map(vm.selectedRowsRight, "subjectUri") // yes, subjectUri
        });

        // and update triples in the grid:
        var triples4grid = [];
        _.each(vm.selectedRowsLeft, function(left) {
          _.each(vm.selectedRowsRight, function(right) {
            triples4grid.push({
              subjectUri:        left.subjectUri,
              predicateUri:      predicate,
              predicateTooltip:  m2rRelations.getRelationTooltip(predicate),
              objectUri:         right.subjectUri
            })
          });
        });
        // insert elements at the beginning
        updateModelArray($scope, $scope.gridOptions.data, triples4grid, false);

        // TODO clear selection on both sides
        // something like but with additional trigger in the sub-components...
        vm.selectedRowsLeft  = [];
        vm.selectedRowsRight = [];
      }
    }
  }

  EnterExternalOntologyUriController.$inject = ['$scope', '$uibModalInstance', 'info', 'focus', 'service'];
  function EnterExternalOntologyUriController($scope, $uibModalInstance, info, focus, service) {
    var vm = $scope.vm = {
      ontUri: ""
    };

    focus("addExtOntUri_form_activation", 700, {select: true});

    $scope.formInvalid = function() {
      if (!vm.ontUri) {
        vm.error = "Invalid URL";
        return true;
      }
      if (_.indexOf(info.ontUris, vm.ontUri) >= 0) {
        vm.error = "Ontology by this URI is already loaded";
        return true;
      }
      vm.error = "";
      return false;
    };

    $scope.doAddExternalOntologyUri = function() {
      vm.errorLoading = "";
      vm.status = vm.loading = "Loading. Please wait...";
      service.getExternalOntologySubjects(vm.ontUri, function(error, osr) {
        vm.status = vm.loading = undefined;
        if (error) {
          console.warn("error getting external ontology info:", error);
          if (error.detail && error.detail.match(/parseException/gi)) {
            vm.errorLoading =
              "This URL could not be loaded or parsed by the ORR backend. " +
              "Make sure you enter a URL that can resolved to an ontology " +
              "representation.";
          }
          else vm.errorLoading = error.error || error;
        }
        else {
          //console.debug("got external ontology info", osr);
          $uibModalInstance.close(osr);
        }
      });
    };

    $scope.cancelAddExternalOntologyUri = function() {
      $uibModalInstance.dismiss();
    };
  }

  ///////////////////////////////////////////////////////

  M2rDataEditorMappingSideDirective.$inject = [];
  function M2rDataEditorMappingSideDirective() {
    if (debug) console.log("++M2rDataEditorMappingSideDirective++");

    return {
      restrict: 'E',
      templateUrl: 'js/ont/m2r/m2r-data-editor-mapping-side.html',
      controller: M2rDataEditorMappingSideController,
      scope: {
        side:            '=',
        mappedOntsInfo:  '=',
        selectedRows:    '='
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
      enableSelectAll: true,  // but mainly to allow deselect-all
      enableColumnMenus: false,
      enableGridMenu: true,
      showGridFooter: true,
      enableFiltering: true,
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

    $scope.gridOptions.onRegisterApi = function(gridApi) {
      $scope.gridApi = gridApi;
      //console.debug("gridApi.selection=", gridApi.selection);
      gridApi.selection.on.rowSelectionChanged($scope, rowSelectionChanged);
      gridApi.selection.on.rowSelectionChangedBatch($scope, rowSelectionChanged);

      function rowSelectionChanged() {
        $scope.selectedRows = gridApi.selection.getSelectedRows();
        console.debug("side=" + $scope.side, "$scope.selectedRows=", $scope.selectedRows.length);
      }
    };
  }

  ///////////////////////////////////////////////////////

  m2rRelationFilter.$inject = ['m2rRelations'];
  function m2rRelationFilter(m2rRelations) {
    return function(predicateUri) {
      var rel = m2rRelations.relations[predicateUri];
      if (rel && rel.prop) {
        //return rel.prop.prefix+ ':' + rel.prop.localName;
        return '<span class="uriTextSimple">' +
          //'<span class="m2rPredPrefix">' +rel.prop.prefix+ ':</span>' +
          rel.prop.localName +
          '</span>'
      }
      else return '?';
      //return rel && rel.icon ? rel.icon : '?';
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
      //console.log("getRelationTooltip: predicateUri=", predicateUri);
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

  function updateModelArray($scope, data, triples, doPush) {
    appUtil.updateModelArray(data, triples,
      function(done) {
        if (done) {
          $scope.$parent.$digest();
        }
        else {
          $scope.$digest();
        }
      },
      300,
      doPush
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
      _.each(mappedOntsInfo, function (moi) {
        if (onlyBasicInfo) {
          getBasicInfo(moi, service);
        }
        else {
          getOntologySubjects(moi, service);
        }
      });
    });

    if (!onlyBasicInfo) $timeout(function() {
      updateSelectableOntUris($scope, service);
    });
  }

  function getBasicInfo(moi, service) {
    moi.loading = true;
    service.refreshOntology(moi.uri, null, function (error, ontology) {
      moi.loading = false;
      if (error) {
        moi.error = error;
        console.warn("error getting info for mapped ontology " + moi.uri, error);
        // TODO try external ontology
      }
      else {
        //console.debug("got mapped ontology info", ontology);
        moi.name    = ontology.name;
        moi.version = ontology.version;
      }
    });
  }

  function getOntologySubjects(moi, service) {
    moi.loading = true;
    service.getOntologySubjects(moi.uri, function(error, osr) {
      moi.loading = false;
      if (error) {
        moi.error = error;
        console.warn("error getting info for mapped ontology "+moi.uri, error);
      }
      else {
        //console.debug("got mapped ontology info", osr);
        moi.name     = osr.name;
        moi.version  = osr.version;
        moi.subjects = osr.subjects;
      }
    });
  }

  function updateSelectableOntUris($scope, service) {
    service.getOntologies(function gotOntologies(error, ontologies) {
      if (error) {
        console.error("error getting ontologies:", error);
      }
      else {
        //console.debug("updateSelectableOntUris: ontologies=", ontologies);
        $scope.vm.selectableOnts = [];
        _.each(ontologies, function(ont) {
          if (_.indexOf($scope.ontData.mappedOnts, ont.uri) < 0) {
            $scope.vm.selectableOnts.push(_.clone(ont));
          }
        })
      }
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
      maxWidth: 110,
      displayName: 'Predicate',
      headerCellClass: 'm2rRelHeader',
      //enableFiltering: false,
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
