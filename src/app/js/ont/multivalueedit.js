(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.multivalueedit', [])
    .directive('orpMultivalueEdit', function() {
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

  MveController.$inject = ['$scope', '$filter', '$timeout', 'cfg', 'utl', 'queryUtil'];

  function MveController($scope, $filter, $timeout, cfg, utl, queryUtil) {
    if (debug) console.log("++MveController++ propUri=", $scope.propUri, "propValue=", $scope.propValue, "disableEditIf=", $scope.disableEditIf);

    if ($scope.propUri) {
      $scope.propValueSelection = cfg.valueSelections[$scope.propUri];
    }

    var em = $scope.em = [];
    _.each($scope.propValue, function(val) {
      em.push({
        id:    em.length + 1,
        value: val
      });
    });
    if (em.length === 0) {
      em.push({
        id:    em.length + 1,
        value: ''
      });
    }

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

    $scope.cellTextAreaKeyUp = function($event, tableForm, em) {
      //console.debug("cellTextAreaKeyUp: keyCode=", $event.keyCode, "$event=", $event);
      if ($event.keyCode == 13 && $event.ctrlKey && $event.shiftKey) {
        $timeout(function() {
          tableForm.$submit();
        });
      }
      else if ($event.keyCode == 187 && $event.ctrlKey && $event.shiftKey) {
        $timeout(function() {
          $scope.addValue(em);
        });
      }
      else if ($event.keyCode == 27) {
        tableForm.$cancel();
      }
    };

    // filter values to show
    $scope.filterValue = function(valueEntry) {
      return valueEntry.isDeleted !== true;
    };

    $scope.selectValue = function(em, id) {
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
            var filtered = $filter('filter')(em, {id: id});
            if (filtered.length) {
              filtered[0].value = options[index];
            }
          }
        });
      }
    };

    // mark valueEntry as deleted
    $scope.deleteValue = function(em, id) {
      var filtered = $filter('filter')(em, {id: id});
      if (filtered.length) {
        filtered[0].isDeleted = true;
      }
    };

    // add valueEntry
    $scope.addValue = function(em) {
      em.push({
        id:    em.length + 1,
        value: '',
        isNew: true
      });
    };

    // cancel all changes
    $scope.cancelCell = function(em) {
      for (var i = em.length; i--;) {
        var valueEntry = em[i];
        // undelete
        if (valueEntry.isDeleted) {
          delete valueEntry.isDeleted;
        }
        // remove new
        if (valueEntry.isNew) {
          em.splice(i, 1);
        }
      }
    };

    // transfer the changes to the model
    $scope.applyCellChanges = function() {
      var result = [];

      for (var i = em.length; i--;) {
        var valueEntry = em[i];
        if (valueEntry.isDeleted) {
          em.splice(i, 1);
        }
        // note: empty string "" is regarded as absent value
        else if (valueEntry.value) {
          result.push(valueEntry.value);
        }
        if (valueEntry.isNew) {
          valueEntry.isNew = false;
        }
      }

      $scope.propValue = result;

      // don't let the cell edit model (array) get empty, so
      // user can later still click cell to edit and add a value
      if (em.length === 0) {
        em.push({id: 0, value: null});
      }
    };
  }

})();
