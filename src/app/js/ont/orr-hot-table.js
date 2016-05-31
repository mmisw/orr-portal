(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.hot-table', ['ngHandsontable'])
    .directive('orrHotTable',  HotTableDirective)
    //.controller('HotTableController',  HotTableController)
  ;

  HotTableDirective.$inject = [];
  function HotTableDirective() {
    return {
      restrict: 'E',
      templateUrl: 'js/ont/orr-hot-table.html',
      controller: HotTableController,
      controllerAs: 'vm',
      scope: {
        colHeaders: '=',
        items: '='
      }
      ,bindToController: true  // because the scope is isolated
    }
  }

  HotTableController.$inject = [];
  function HotTableController() {
    if (debug) console.debug("++HotTableController++");
    var vm = this;

    vm.colRenderer = function(hotInstance, td, row, col, prop, value, cellProperties) {
      //if (col === 0) {
      //  td.className = 'v2rTermBg';
      //}

      td.innerHTML = appUtil.htmlifyObject(value, true);
    }
  }

})();
