(function() {
  'use strict';

  angular.module('orrportal.multivalueedit', [])
    .directive('orpMultivalueEdit', function() {
      return {
        restrict:     'E',
        scope:        {
          propValue: '='
        },
        controller:   MveController,
        templateUrl:  'js/uri/views/multivalueedit.tpl.html'
      }
    })
  ;

  MveController.$inject = ['$scope', '$filter'];

  function MveController($scope, $filter) {
    //console.log("++MveController++ propValue=", $scope.propValue);

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

    $scope.enterCellEditing = function(tableForm) {
      tableForm.$show()
    };

    // filter values to show
    $scope.filterValue = function(valueEntry) {
      return valueEntry.isDeleted !== true;
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
