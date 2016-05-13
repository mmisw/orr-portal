(function() {
'use strict';

angular.module('orrportal.ontgrid', ['ui.grid'])

    .controller('OntGridController', OntGridController)
;

OntGridController.$inject = ['$scope', '$stateParams', '$location', '$filter', 'uiGridConstants'];

function OntGridController($scope, $stateParams, $location, $filter, uiGridConstants) {
    if (appUtil.debug) console.log("++OntGridController++");

    $scope.ontItems = [];

    $scope.tableOpts = {globalFilter: ''};

    var mkUriLinkCellTemplate =
        '<div class="ui-grid-cell-contents">' +
        '<span ng-bind-html="row.entity[col.field] | mklink4uriWithSelfHostPrefix"></span>'
        + '</div>';

    var mklinksCellTemplate =
        '<div class="ui-grid-cell-contents">' +
        '<span ng-bind-html="row.entity[col.field] | mklinks"></span>'
        + '</div>';

    var markCellTemplate =
        '<div class="ui-grid-cell-contents">' +
        '<span ng-bind-html="row.entity | mkMarks"></span>'
        + '</div>';

    var ownerCellTemplate =
        '<div class="ui-grid-cell-contents">' +
        '<span ng-bind-html="row.entity[col.field] | mkOwnerLink"></span>'
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
            { field: 'uri',       width: '***', minWidth: 400, displayName: 'URI', enableHiding: false, cellTemplate: mkUriLinkCellTemplate },
            { field: 'name',      width: '*****', cellTemplate: markCellTemplate },
            { field: 'author',    width: '**'},
            { field: 'ownerName', width: '*', displayName: 'Owner', cellTemplate: ownerCellTemplate},
            { field: 'version',   width: '*', sort: { direction: uiGridConstants.DESC } }
        ];
    }
    function adjustColumnDefs(ontologies) {
        var dataHasSubmitter = _.some(ontologies, "submitter");
        var gridHasSubmitter = _.some($scope.gridOptions.columnDefs, {field: "submitter"});
        if (dataHasSubmitter !== gridHasSubmitter) {
            if (dataHasSubmitter) {
                $scope.gridOptions.columnDefs.push(
                    {field: 'submitter', width: '*', cellTemplate: userCellTemplate}
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

    parseRouteParams($scope, $stateParams);

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

    $scope.$on('evtSetFacetSelectedOntologies', function(event, ontologies) {
        //console.log(appUtil.logTs() + ": on setFacetSelectedOntologies");
        adjustColumnDefs(ontologies);
        addOntologies($scope, ontologies);
    });

}

function parseRouteParams($scope, $stateParams) {
    $scope.tableOpts.globalFilter = $stateParams.so;
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
