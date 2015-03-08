(function() {
'use strict';

angular.module('orrportal.ontgrid', ['ui.grid'])

    .controller('OntGridController', OntGridController)
;

OntGridController.$inject = ['$scope', '$routeParams', '$location', '$filter', 'uiGridConstants'];

function OntGridController($scope, $routeParams, $location, $filter, uiGridConstants) {
    if (appUtil.debug) console.log("++OntGridController++");

    $scope.ontItems = [];

    $scope.tableOpts = {globalFilter: ''};

    var mklinksCellTemplate =
        '<div class="ui-grid-cell-contents">' +
        '<span ng-bind-html="row.entity[col.field] | mklinks"></span>'
        + '</div>';

    var markCellTemplate =
        '<div class="ui-grid-cell-contents">' +
        '<span ng-bind-html="row.entity | mkMarks"></span>'
        + '</div>';

    var orgCellTemplate =
        '<div class="ui-grid-cell-contents">' +
        '<span ng-bind-html="row.entity[col.field] | mkOrgLink"></span>'
        + '</div>';

    var userCellTemplate =
        '<div class="ui-grid-cell-contents">' +
        '<span ng-bind-html="row.entity[col.field] | mkUserLink"></span>'
        + '</div>';

    $scope.gridOptions = {
        data: $scope.ontItems
        ,enableGridMenu: true
        ,showGridFooter: true
        //,enableFiltering: true
        //, rowHeight: 40
        //,onRegisterApi: function(gridApi) {
        //    $scope.gridApi = gridApi;
        //}
    };

    $scope.gridOptions.columnDefs = getCommonColumnDefs();

    function getCommonColumnDefs() {
        return [
            { field: 'uri',       minWidth: 400, displayName: 'URI', enableHiding: false, cellTemplate: mklinksCellTemplate },
            { field: 'name',      cellTemplate: markCellTemplate },
            { field: 'author',    width: 220},
            { field: 'orgName',   width: 110, displayName: 'Org', cellTemplate: orgCellTemplate},
            { field: 'version',   width: 130, sort: { direction: uiGridConstants.DESC } }
        ];
    }
    function adjustColumnDefs(ontologies) {
        var dataHasSubmitter = _.some(ontologies, "submitter");
        var gridHasSubmitter = _.some($scope.gridOptions.columnDefs, {field: "submitter"});
        if (dataHasSubmitter !== gridHasSubmitter) {
            if (dataHasSubmitter) {
                $scope.gridOptions.columnDefs.push(
                    {field: 'submitter', width: 120, cellTemplate: userCellTemplate}
                );
            }
            else {
                $scope.gridOptions.columnDefs = getCommonColumnDefs();
            }
        }
    }

    $scope.filterData = function(termObj) {
        termObj = termObj || $scope.tableOpts.globalFilter;
        $scope.gridOptions.data = $scope.ontItems;
        while (termObj) {
            var oSearchArray = termObj.split(' ');
            $scope.gridOptions.data = $filter('filter')($scope.gridOptions.data, oSearchArray[0], undefined);
            oSearchArray.shift();
            termObj = (oSearchArray.length !== 0) ? oSearchArray.join(' ') : '';
        }
    };

    parseRouteParams($scope, $routeParams);

    $scope.doSearch = function() {
        searchSettingsChanged($scope, $location);
    };
    $scope.searchKeyPressed = function($event) {
        if ($event.keyCode == 13) {
            $scope.doSearch();
        }
    };
    $scope.clearSearch = function() {
        $scope.tableOpts.globalFilter = '';
        $scope.filterData();
        searchSettingsChanged($scope, $location);
    };

    $scope.$on('setFacetSelectedOntologies', function(event, ontologies) {
        //console.log(appUtil.logTs() + ": on setFacetSelectedOntologies");
        adjustColumnDefs(ontologies);
        addOntologies($scope, ontologies);
    });

}

function parseRouteParams($scope, $routeParams) {
    $scope.tableOpts.globalFilter = $routeParams.so;
}

function searchSettingsChanged($scope, $location) {
    var searchText = $scope.tableOpts.globalFilter !== undefined ? $scope.tableOpts.globalFilter.trim() : '';
    if (searchText.length == 0) {
        $location.url("/");
    }
    else {
        var url = "/so/" + searchText;
        $location.url(url);
    }
}

function addOntologies($scope, ontologies) {
    $scope.gridOptions.data = $scope.ontItems = ontologies;
    $scope.filterData();
}

})();
