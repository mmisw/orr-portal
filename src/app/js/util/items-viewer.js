(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.items-viewer', ['ui.grid.grouping'])
    .directive('itemsViewer',  TriplesViewerDirective)
  ;

  TriplesViewerDirective.$inject = [];
  function TriplesViewerDirective() {
    if (debug) console.log("++TriplesViewerDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/util/items-viewer.tpl.html',
      controller: TriplesViewerController,
      scope: {
        columnDefs: '=',
        items:      '='
      }
    }
  }

  TriplesViewerController.$inject = ['$scope'];
  function TriplesViewerController($scope) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.debug("++TriplesViewerController++ $scope=", $scope);

    // TODO proper filtering; for now all links external
    var mklinksOnlyExternal =
      '<div class="ui-grid-cell-contents">' +
      '<span ng-bind-html="row.entity[col.field] | mklinksOnlyExternal"></span>'
      + '</div>';

    // http://ui-grid.info/docs/#/tutorial/209_grouping
    var groupingCellTemplate =
      '<div><div ng-if="!col.grouping ' +
      '|| col.grouping.groupPriority === undefined ' +
      '|| col.grouping.groupPriority === null ' +
      '|| ( row.groupHeader && col.grouping.groupPriority === row.treeLevel )"' +
      ' class="ui-grid-cell-contents"' +
      ' title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}' +
      '</div></div>';

    var gridApi;

    //console.table($scope.columnDefs);

    $scope.gridOptions = {
      data: 'items',
      columnDefs: $scope.columnDefs
      ,enableGridMenu: true
      ,showGridFooter: true
      ,enableFiltering: true
      ,onRegisterApi: function(api) {
        gridApi = api;
      }
    };

    $scope.allowGrouping = false;
    $scope.$watch("allowGrouping", function(allowGrouping) {
      _.each($scope.gridOptions.columnDefs, function(cd) {
        cd.cellTemplate = allowGrouping ? groupingCellTemplate : mklinksOnlyExternal;
      });
      if (allowGrouping && gridApi && gridApi.treeBase) {
        gridApi.treeBase.toggleRowTreeState(gridApi.grid.renderContainers.body.visibleRowCache[0]);
      }
    });
  }

})();
