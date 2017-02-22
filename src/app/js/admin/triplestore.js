(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.admin.triplestore', [])
    .directive('orrTs',  TripleStoreDirective)
  ;

  TripleStoreDirective.$inject = [];
  function TripleStoreDirective() {
    if (debug) console.log("++TripleStoreDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/admin/triplestore.html',
      controller: TripleStoreController
    }
  }

  var GETTING_SIZE_MSG = "Getting size...";
  var RELOADING_MSG = "Reloading triple store in the backend. This may take several minutes, please wait...";

  var tsSize = undefined;

  TripleStoreController.$inject = ['$rootScope', '$scope', '$location', 'service'];

  function TripleStoreController($rootScope, $scope, $location, service) {
    if (appUtil.debug) console.log("++TripleStoreController++");

    $rootScope.rvm.curView = 'ts';

    if (!$rootScope.userLoggedInIsAdmin()) {
      $location.url("/");
      return;
    }

    var vm = $scope.vm = {
      tsRoute: appConfig.orront.rest + "/api/v0/ts",
      tsSize: tsSize || "?",
      reloadResult: "",
      working: false
    };

    $scope.getSize = function() {
      vm.working = GETTING_SIZE_MSG;
      vm.error = undefined;
      service.getTripleStoreSize(undefined, function(error, result) {
        vm.working = undefined;
        if (error) {
          console.log("error getting triple store size:", error);
          vm.error = errorMsg(error);
        }
        else {
          vm.tsSize = tsSize = result.size || "?";
        }
      });
    };

    $scope.reloadTripleStore = function() {
      vm.working = RELOADING_MSG;
      vm.reloadResult = vm.error = undefined;
      // uri undefined to trigger reload of whole triple store.
      service.reloadTripleStore(undefined, function(error, result) {
        vm.working = undefined;
        if (error) {
          console.error("error reloading triple store:", error);
          vm.error = errorMsg(error);
        }
        else {
          if (debug) console.debug("reloadTripleStore result:", result);
          vm.reloadResult = result.msg || angular.toJson(result);
          $scope.getSize();
        }
      });
    };

    function errorMsg(error) {
      var str = angular.toJson(error);
      if (str === "{}") {
        return "An error occurred. Please check console log.";
      }
      else return "Error: " +str;
    }

    $scope.$on('evtAuthenticateStateChanged', function() {
      if (tsSize !== undefined) {
        $scope.getSize();
      }
    });

    if (tsSize === undefined) {
      // automatically tried first time this module is loaded.
      $scope.getSize();
    }
  }

})();
