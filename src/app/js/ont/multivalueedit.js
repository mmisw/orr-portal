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
        templateUrl:  'js/ont/multivalueedit.html'
      }
    })
  ;

  MveController.$inject = ['$scope', '$timeout', 'cfg', 'utl', 'queryUtil'];

  function MveController($scope, $timeout, cfg, utl, queryUtil) {
    if (debug) console.log("++MveController++ propUri=", $scope.propUri, "propValue=", $scope.propValue, "disableEditIf=", $scope.disableEditIf);

    if ($scope.propUri) {
      $scope.propValueSelection = cfg.valueSelections[$scope.propUri];
    }

    $scope.valueEntry = ($scope.propValue || []).join(VAL_SEPARATOR_INSERT);
    $scope.textAreaRows = 1 + $scope.valueEntry.split('\n').length;

    $scope.$watch("attrTableform.$visible", function(vis) {
      //console.log("$watch attrTableform.$visible", vis);
      $scope.editInProgress({inProgress: vis});
    });

    $scope.enterCellEditing = function(tableForm) {
      if (!$scope.disableEditIf) {
        tableForm.$show()
      }
    };

    $scope.cellKeyUp = function($event, tableForm) {
      if ($event.keyCode == 13) {
        $scope.enterCellEditing(tableForm);
      }
    };

    $scope.cellTextAreaKeyUp = function($event, tableForm) {
      //console.debug("cellTextAreaKeyUp: keyCode=", $event.keyCode, "$event=", $event);
      if ($event.keyCode == 13 && !$event.ctrlKey) {
        $scope.applyAndSubmit(tableForm);
      }
      else if ($event.keyCode == 27) {
        tableForm.$cancel();
      }
    };

    $scope.applyAndSubmit = function(tableForm) {
      $timeout(function() {
        $scope.applyCellChanges();
        tableForm.$submit();
      }, 50);
    };

    $scope.selectValue = function(tableForm) {
      var title = 'Class: <span class="uriTextSimple">' +$scope.propValueSelection.class+ '</span>';
      if ($scope.propValueSelection.options) {
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
        queryUtil.getPropValueOptions($scope.propUri, $scope.propValueSelection, function (error, options) {
          progressModal.close();
          if (error) {
            console.error(error);
            utl.error({errorPRE: error});
          }
          else {
            $scope.propValueSelection.options = options;
            doSelect();
          }
        });
      }

      function doSelect() {
        if (debug) console.debug("doSelect: propValueSelection=", $scope.propValueSelection);
        var options = $scope.propValueSelection.options;
        utl.selectFromList({
          title: title,
          selectPlaceholder: 'Select a term',
          options: options,
          selected: function(index) {
            var value = options[index];
            setPropValueFromValueEntry();
            $scope.propValue.push(value);
            setValueEntryFromPropValue();
            $scope.applyAndSubmit(tableForm);
          }
        });
      }
    };

    function setPropValueFromValueEntry() {
      $scope.propValue = [];
      var values = $scope.valueEntry.split(VAL_SEPARATOR_REGEX);
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
          $scope.propValue.push(valResultString);
        }
      });
      //console.debug("$scope.propValue=", $scope.propValue);
    }
    function setValueEntryFromPropValue() {
      $scope.valueEntry = $scope.propValue.join(VAL_SEPARATOR_INSERT);
      $scope.textAreaRows = 1 + $scope.valueEntry.split('\n').length;
      //console.debug("$scope.valueEntry=", [$scope.valueEntry]);
    }

    // transfer the changes to the model
    $scope.applyCellChanges = function() {
      setPropValueFromValueEntry();
      setValueEntryFromPropValue();
    };

    $scope.cellEditTooltip =
      '<div class="left">' +
      '<p>Cell editing:</p>' +
      '<p>For a multi-line value, type [Ctrl-Enter] to insert new lines.</p>' +
      '<p>For multiple values in the cell, enter five dashes in a line by itself as the value separator.</p>' +
      '</div>'
    ;
  }

})();
