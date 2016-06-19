(function() {
  'use strict';

  var debug = appUtil.debug;

  angular.module('orrportal.util')
    .directive('clipboardCopy', ClipboardCopyDirective)
  ;

  ClipboardCopyDirective.$inject = [];
  function ClipboardCopyDirective() {
    if (debug) console.log("++ClipboardCopyDirective++");
    return {
      restrict:  'E',
      templateUrl: 'js/util/clipboardCopy.html',
      controller: ClipboardCopyController,
      scope: {
        text:   '='
      },
      controllerAs: 'vm',
      bindToController: true
    }
  }

  ClipboardCopyController.$inject = ['$timeout'];
  function ClipboardCopyController($timeout) {
    var vm = this;
    vm.debug = debug;
    if (debug) console.log("++ClipboardCopyController++ vm=", vm);

    var baseTooltip = vm.tooltip = 'Copy to clipboard';

    function setTooltip(tooltip) {
      vm.tooltip = tooltip;
      $timeout(function() {
        vm.tooltip = baseTooltip;
      }, 2000);
    }

    vm.success = function() {
      setTooltip('<b>Copied!</b>');
    };

    vm.fail = function(err) {
      setTooltip('<b>Error</b>');
      var msg = "Sorry, your browser may not support copying to the clipboard. Reported error: " + err;
      $timeout(function() {alert(msg);}, 250);
    }
  }

})();
