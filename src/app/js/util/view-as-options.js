(function() {
  'use strict';

  var debug = appUtil.debug;

  angular.module('orrportal.util')
    .directive('viewAsOptions', ViewAsOptionsDirective)
  ;

  ViewAsOptionsDirective.$inject = [];
  function ViewAsOptionsDirective() {
    if (debug) console.log("++ViewAsOptionsDirective++");
    return {
      restrict:  'E',
      templateUrl: 'js/util/view-as-options.html',
      controller: ViewAsOptionsController,
      scope: {
        options:   '='
      },
      controllerAs: 'vm',
      bindToController: true
    }
  }

  ViewAsOptionsController.$inject = [];
  function ViewAsOptionsController() {
    var vm = this;
    vm.debug = debug;
    if (debug) console.log("++ViewAsOptionsController++ vm=", vm);

  }

})();
