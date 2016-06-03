(function() {
  'use strict';

  angular.module('orrportal.util', [])
    .controller('UtilCtrl', UtilCtrl)
    .controller('MessageInstanceCtrl', MessageInstanceCtrl)
    .factory('utl', miscUtils)
    .factory('focus', focus)
    .directive('focusOn', focusOn)
  ;

  UtilCtrl.$inject = ['$scope', '$uibModal'];

  function UtilCtrl($scope, $uibModal) {
    $scope.$on('evtConfirm', function (event, info) {
      if (!info.title) info.title = "Confirm";
      $scope.info = info;
      var modalInstance = $uibModal.open({
        templateUrl: 'js/util/confirm.tpl.html',
        controller:  'MessageInstanceCtrl',
        size:        'sm',
        backdrop:    'static',
        resolve: {
          info: function () {
            return $scope.info;
          }
        }
      });
      modalInstance.result.then(function () {
        //console.log('Confirmation accepted', arguments);
        $scope.info.ok()
      }, function () {
        //console.log('Confirmation dismissed', arguments);
      });
    });

    $scope.$on('evtMessage', function (event, info) {
      $scope.info = info;
      var modalInstance = $uibModal.open({
        templateUrl: 'js/util/message.tpl.html',
        controller:  'MessageInstanceCtrl',
        //size:        'sm',
        backdrop:    'static',
        resolve: {
          info: function () {
            return $scope.info;
          }
        }
      });
      modalInstance.result.then(function () {
        if ($scope.info.ok) $scope.info.ok()
      }, function () {
        if ($scope.info.cancel) $scope.info.cancel();
        else if ($scope.info.ok) $scope.info.ok();
      });
    });

    $scope.$on('evtSelect', function (event, info) {
      $scope.info = info;
      var modalInstance = $uibModal.open({
        templateUrl: 'js/util/select.tpl.html',
        controller:  'MessageInstanceCtrl',
        //size:        'sm',
        backdrop:    'static',
        resolve: {
          info: function () {
            return $scope.info;
          }
        }
      });
      modalInstance.result.then(function (index) {
        if ($scope.info.selected) $scope.info.selected(index)
      }, function () {
        if ($scope.info.cancel) $scope.info.cancel();
      });
    });

    $scope.$on('evtError', function (event, info) {
      $scope.info = info;
      if (!info.title) info.title = "Error";
      var modalInstance = $uibModal.open({
        templateUrl: 'js/util/message.tpl.html',
        controller:  'MessageInstanceCtrl',
        backdrop:    'static',
        size:        info.size !== undefined ? info.size : 'lg',
        resolve: {
          info: function () {
            return $scope.info;
          }
        }
      });
      modalInstance.result.then(function () {
        if ($scope.info.ok) $scope.info.ok()
      }, function () {
        if ($scope.info.cancel) $scope.info.cancel();
        else if ($scope.info.ok) $scope.info.ok();
      });
    });
  }

  MessageInstanceCtrl.$inject = ['$scope', '$uibModalInstance', 'info'];

  function MessageInstanceCtrl($scope, $uibModalInstance, info) {
    $scope.info = info;

    $scope.ok = function() {
      $uibModalInstance.close();
    };

    $scope.select = function(index) {
      $uibModalInstance.close(index);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }

  miscUtils.$inject = ['$rootScope', '$uibModal'];
  function miscUtils($rootScope, $uibModal) {
    return {
      confirm: function (info) {
        $rootScope.$broadcast('evtConfirm', info);
      },
      message: function (info) {
        $rootScope.$broadcast('evtMessage', info);
      },
      select: function (info) {
        $rootScope.$broadcast('evtSelect', info);
      },
      error: function (info) {
        $rootScope.$broadcast('evtError', info);
      },

      openRegistrationProgressModal: openRegistrationProgressModal
    };

    function openRegistrationProgressModal(uri) {
      return $uibModal.open({
        templateUrl: 'js/util/message.tpl.html',
        controller:  'MessageInstanceCtrl',
        //size:        'sm',
        backdrop:    'static',
        resolve: {
          info: function () {
            return {
              title:   "Registering ...",
              message: '<div class="center">' +
              'Ontology URI:' +
              '<br>' +
              '<div class="uriText1">' +uri+ '</div>' +
              '</div>' +
              '<div>' +
              '<br>' +
              '<span class="fa fa-spinner fa-spin"></span> ' +
              'Please wait ...' +
              '</div>',
              ok: null  // no OK button
            };
          }
        }
      });
    }
  }

  // focus http://stackoverflow.com/a/18295416/830737
  focus.$inject = ['$rootScope', '$timeout'];
  function focus($rootScope, $timeout) {
    return function(name, delay, options) {
      $timeout(function (){
        $rootScope.$broadcast('focusOn', name, options);
      }, delay);
    }
  }
  function focusOn() {
    return function(scope, elem, attr) {
      scope.$on('focusOn', function(e, name, options) {
        if(name === attr.focusOn) {
          elem[0].focus();
          if (options && options.select) {
            elem[0].select && elem[0].select();
          }
        }
      });
    };
  }

})();
