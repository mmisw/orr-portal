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
        text:     '=',
        tooltip:  '='
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

    var baseTooltip = vm.tooltip || 'Copy to clipboard';
    vm.runTooltip = baseTooltip;

    function setTooltip(tooltip) {
      vm.runTooltip = tooltip;
      $timeout(function() {
        vm.runTooltip = baseTooltip;
      }, 2000);
    }

    vm.success = function() {
      setTooltip('<b>Copied!</b>');
    };

    vm.fail = function(err) {
      setTooltip('<b>Error</b>');
      var msg = "Sorry, your browser may not support copying to the clipboard directly";
      $timeout(function() {alert(msg);}, 250);
      console.error(msg, "Reported error:", err);
    }
  }

})();
