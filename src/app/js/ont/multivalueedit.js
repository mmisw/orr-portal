(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  var VAL_SEPARATOR_INSERT = '\n-----\n';
  var VAL_SEPARATOR_REGEX  = /\n+-----\n+/;

  angular.module('orrportal.multivalueedit', [])
    .directive('multivalueedit', function() {
      return {
        restrict:     'E',
        scope:        {
          propUri:        '=',
          propValue:      '=',
          disableEditIf:  '=',
          editInProgress: '&'
        },
        controller:   MveController,
        controllerAs: 'vm',
        bindToController: true,
        templateUrl:  'js/ont/multivalueedit.html'
      }
    })
  ;

  MveController.$inject = ['$scope', '$timeout', 'cfg', 'utl', 'queryUtil'];

  function MveController($scope, $timeout, cfg, utl, queryUtil) {
    var vm = this;
    vm.debug = debug;
    if (debug) console.log("++MveController++ propUri=", vm.propUri, "propValue=", vm.propValue, "disableEditIf=", vm.disableEditIf);

    if (vm.propUri) {
      vm.propValueSelection = cfg.valueSelections[vm.propUri];
    }

    vm.valueEntry = (vm.propValue || []).join(VAL_SEPARATOR_INSERT);
    vm.textAreaRows = 1 + vm.valueEntry.split('\n').length;

    $scope.$watch("vm.propValue", function(propValue) {
      //console.debug("$watch: vm.propValue=", propValue);
      setValueEntryFromPropValue();
    }, true);

    $scope.$watch("attrTableform.$visible", function(vis) {
      //console.log("$watch attrTableform.$visible", vis);
      vm.editInProgress({inProgress: vis});
    });

    vm.enterCellEditing = function(tableForm) {
      if (!vm.disableEditIf) {
        tableForm.$show()
      }
    };

    vm.cellKeyUp = function($event, tableForm) {
      if ($event.keyCode == 13) {
        vm.enterCellEditing(tableForm);
      }
    };

    vm.cellTextAreaKeyUp = function($event, tableForm) {
      //console.debug("cellTextAreaKeyUp: keyCode=", $event.keyCode, "$event=", $event);
      if ($event.keyCode == 13 && !$event.ctrlKey) {
        vm.applyAndSubmit(tableForm);
      }
      else if ($event.keyCode == 27) {
        tableForm.$cancel();
      }
    };

    vm.applyAndSubmit = function(tableForm) {
      $timeout(function() {
        vm.applyCellChanges();
        tableForm.$submit();
      }, 50);
    };

    vm.selectValue = function(tableForm) {
      var title = 'Class: <span class="uriTextSimple">' +vm.propValueSelection.class+ '</span>';
      if (vm.propValueSelection.options) {
        doSelect();
      }
      else {
        var progressModal = utl.openProgressModal({
          title: title,
          size: 'md',
          message: '<div class="center">' +
          'Retrieving class terms' +
          '<br>' +
          '<i class="fa fa-spinner fa-spin"></i> Please wait ...' +
          '</div>',
          ok: null  // no OK button
        });
        queryUtil.getPropValueOptions(vm.propUri, vm.propValueSelection, function (error, options) {
          progressModal.close();
          if (error) {
            console.error(error);
            utl.error({errorPRE: error});
          }
          else {
            vm.propValueSelection.options = options;
            doSelect();
          }
        });
      }

      function doSelect() {
        if (debug) console.debug("doSelect: propValueSelection=", vm.propValueSelection);
        var options = vm.propValueSelection.options;
        utl.selectFromList({
          title: title,
          selectPlaceholder: 'Select a term',
          options: options,
          selected: function(index) {
            var value = options[index];
            setPropValueFromValueEntry();
            vm.propValue.push(value);
            setValueEntryFromPropValue();
            vm.applyAndSubmit(tableForm);
          }
        });
      }
    };

    function setPropValueFromValueEntry() {
      vm.propValue = [];
      var values = vm.valueEntry.split(VAL_SEPARATOR_REGEX);
      _.each(values, function (val) {
        var valLines = (val || "").trim().split('\n');
        var valResult = [];
        _.each(valLines, function(line) {
          if (line.trim() !== VAL_SEPARATOR_INSERT.trim()) {
            valResult.push(line);
          }
        });
        var valResultString = valResult.join('\n');
        if (valResultString) {
          vm.propValue.push(valResultString);
        }
      });
      //console.debug("vm.propValue=", vm.propValue);
    }
    function setValueEntryFromPropValue() {
      vm.valueEntry = (vm.propValue || []).join(VAL_SEPARATOR_INSERT);
      vm.textAreaRows = 1 + vm.valueEntry.split('\n').length;
      //console.debug("vm.valueEntry=", [vm.valueEntry]);
    }

    // transfer the changes to the model
    vm.applyCellChanges = function() {
      setPropValueFromValueEntry();
      setValueEntryFromPropValue();
    };

    vm.cellEditTooltip =
      '<div class="left">' +
      '<p>Cell editing:</p>' +
      '<p>For a multi-line value, type [Ctrl-Enter] to insert new lines.</p>' +
      '<p>For multiple values in the cell, enter five dashes in a line by itself as the value separator.</p>' +
      '</div>'
    ;
  }

})();
