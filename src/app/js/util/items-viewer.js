(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.items-viewer', ['ui.grid.grouping'])
    .directive('itemsViewer',  ItemsViewerDirective)
  ;

  ItemsViewerDirective.$inject = [];
  function ItemsViewerDirective() {
    if (debug) console.log("++ItemsViewerDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/util/items-viewer.tpl.html',
      controller: ItemsViewerController,
      scope: {
        columnDefs: '=',
        someColumnDefs: '=',
        items:      '='
      }
    }
  }

  ItemsViewerController.$inject = ['$scope'];
  function ItemsViewerController($scope) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.debug("++ItemsViewerController++ $scope=", $scope);

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


    var columnDefs;
    if ($scope.columnDefs) {
      columnDefs = $scope.columnDefs;
    }
    else {
      if ($scope.someColumnDefs) {
        columnDefs = _.clone($scope.someColumnDefs);
        var collectedKeys = _.map(columnDefs, "field");
        var max = Math.min($scope.items.length, 20);
        for (var ii = 0; ii < max; ii++) {
          var itemKeys = _.keys($scope.items[ii]);
          _.each(itemKeys, function(itemKey) {
            if (!_.contains(collectedKeys, itemKey)) {
              collectedKeys.push(itemKey);
              columnDefs.push({field: itemKey});
            }
          })
        }
      }
    }
    if (columnDefs) {
      _.each(columnDefs, function(columnDef) {
        if (columnDef.cellTemplate === undefined) {
          columnDef.cellTemplate = mklinksOnlyExternal;
        }
      })
    }
    //console.table(columnDefs);

    $scope.gridOptions = {
      data: 'items',
      columnDefs: columnDefs
      ,enableGridMenu: true
      ,showGridFooter: true
      ,enableFiltering: true
      ,onRegisterApi: function(api) {
        //$scope.gridApi = api;   // TODO grouping got broken for some reason, so disable for now
      }
    };

    //var vm = $scope.vm = {allowGrouping: false};
    //vm.allowGrouping = false;
    //$scope.$watch("vm.allowGrouping", function(allowGrouping) {
    //  //console.debug("vm.allowGrouping=", allowGrouping);
    //  _.each($scope.gridOptions.columnDefs, function(cd) {
    //    cd.cellTemplate = allowGrouping ? groupingCellTemplate : mklinksOnlyExternal;
    //  });
    //  if (allowGrouping && $scope.gridApi && $scope.gridApi.treeBase) {
    //    $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[0]);
    //  }
    //});
  }

})();
