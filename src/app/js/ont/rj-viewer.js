(function() {
  'use strict';

  var debug = appUtil.debug;
  debug = true;

  angular.module('orrportal.rj-viewer', [])
    .directive('rjDataViewer',  RjDataViewerDirective)
  ;

  RjDataViewerDirective.$inject = [];
  function RjDataViewerDirective() {
    if (debug) console.log("++RjDataViewerDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/ont/views/rj-data-viewer.tpl.html',
      controller: RjDataViewerController,
      scope: {
        uri:  '=',
        rj:   '='
      }
    }
  }

  RjDataViewerController.$inject = ['$scope', 'uiGridConstants'];
  function RjDataViewerController($scope, uiGridConstants) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.debug("++RjDataViewerController++ $scope=", $scope);

    var triples = [];
    _.each($scope.rj, function(subjectProps, subjectUri) {
      // do not include the ontology URI itself as a subject:
      if (subjectUri !== $scope.uri) {
        _.each(subjectProps, function (propValues, propUri) {
          _.each(propValues, function (value) {
            triples.push({
              subjectUri: subjectUri,
              propUri: propUri,
              value: value.value
            });
          });
        });
      }
    });
    triples = _.sortBy(triples, "subjectUri");

    // TODO proper filtering; for now all links external
    var mklinksOnlyExternal =
      '<div class="ui-grid-cell-contents">' +
      '<span ng-bind-html="row.entity[col.field] | mklinksOnlyExternal"></span>'
      + '</div>';

    $scope.gridOptions = {
      data: [],
      columnDefs: [
        {
          field: 'subjectUri',
          //width: '**',
          displayName: 'Subject',
          cellTemplate: mklinksOnlyExternal
        },
        {
          field: 'propUri',
          //width: '**',
          displayName: 'Predicate',
          cellTemplate: mklinksOnlyExternal
        },
        {
          field: 'value',
          //width: '*****',
          displayName: 'Object',
          cellTemplate: mklinksOnlyExternal
        }
      ]
      ,enableGridMenu: true
      ,showGridFooter: true
      //,enableFiltering: true
      //, rowHeight: 40
      //,onRegisterApi: function(api) {
      //    gridApi = api;
      //}
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

    if (debug) console.debug("++RjDataViewerController++ triples=", $scope.subjects);
  }

})();
