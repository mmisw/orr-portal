(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.rj-viewer', ['ui.grid.grouping'])
    .directive('rjDataViewer',  RjDataViewerDirective)
  ;

  RjDataViewerDirective.$inject = [];
  function RjDataViewerDirective() {
    if (debug) console.log("++RjDataViewerDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/ont/rj/rj-viewer.html',
      controller: RjDataViewerController,
      controllerAs: 'vm',
      scope: {
        uri:  '=',
        rj:   '=',
        columnDefs: '=',
        items: '='
      },
      bindToController: true
    }
  }

  RjDataViewerController.$inject = ['$scope'];
  function RjDataViewerController($scope) {
    var vm = this;
    vm.debug = debug;
    if (debug) console.debug("++RjDataViewerController++ vm=", vm);

    var mkUriLinkCellTemplate =
      '<div class="ui-grid-cell-contents">' +
      '<span ng-bind-html="row.entity[col.field] | mklink4uriWithSelfHostPrefix"></span>'
      + '</div>';

    var mkLinksCellTemplate =
      '<div class="ui-grid-cell-contents">' +
      '<span ng-bind-html="row.entity[col.field] | mklinks"></span>'
      + '</div>';

    vm.columnDefs = [
      {
        field: 'subjectUri',
        displayName: 'Subject',
        cellTemplate: mkUriLinkCellTemplate
      },
      {
        field: 'propUri',
        displayName: 'Predicate',
        cellTemplate: mkUriLinkCellTemplate
      },
      {
        field: 'value',
        displayName: 'Object',
        cellTemplate: mkLinksCellTemplate
      }
    ];

    var items = [];
    _.each(vm.rj, function(subjectProps, subjectUri) {
      // do not include the ontology URI itself as a subject:
      if (subjectUri !== vm.uri) {
        _.each(subjectProps, function (propValues, propUri) {
          _.each(propValues, function (value) {
            items.push({
              subjectUri: subjectUri,
              propUri: propUri,
              value: value.value
            });
          });
        });
      }
    });
    items = _.sortBy(items, function(item) {
      // put the blank nodes last
      return item.subjectUri.startsWith("_:") ? "zzz" : item.subjectUri;
    });

    vm.items = [];
    appUtil.updateModelArray(vm.items, items,
      function(done) {
        if (done) {
          $scope.$parent.$digest();
          if (debug) console.debug("Done update model array: vm.items=", vm.items.length);
        }
        else {
          $scope.$digest();
        }
      },
      300
    );
  }

})();
