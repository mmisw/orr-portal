(function() {
  'use strict';

  angular.module('orrportal.search', [
    'orrportal.st',
    'orrportal.kw'
  ])
    .controller('SearchController', SearchController)
  ;

  SearchController.$inject = ['$scope', '$stateParams', '$location'];

  function SearchController($scope, $stateParams, $location) {
    if (appUtil.debug) console.log("++SearchController++");

    var vm = $scope.vm = {};

    if ($stateParams.st !== undefined) {
      vm.st = $stateParams.st;
      $scope.active = 1;
    }
    else if ($stateParams.kw !== undefined) {
      vm.kw = $stateParams.kw.replace(/\s*,\s*/g, ", ");
      $scope.active = 2;
    }

    $scope.active = vm.st !== undefined ? 1 : 2;

    $scope.tabStClicked = function() {
      $scope.active = 1;
      $location.url("st/");
    };

    $scope.tabKwClicked = function() {
      $scope.active = 2;
      $location.url("kw/");
    };
  }

})();
