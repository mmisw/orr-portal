(function() {
  'use strict';

  angular.module('orrportal.util', [])
    .controller('UtilCtrl', UtilCtrl)
    .controller('MessageInstanceCtrl', MessageInstanceCtrl)
    .factory('utl', miscUtils)
    .factory('focus', focus)
    .directive('focusOn', focusOn)
    .filter('orPropsFilter', orPropsFilter)
    .filter('trustAsResourceUrl', trustAsResourceUrl)
  ;

  UtilCtrl.$inject = ['$scope', '$uibModal'];

  function UtilCtrl($scope, $uibModal) {
    $scope.$on('evtConfirm', function (event, info) {
      if (!info.title) info.title = "Confirm";
      $scope.info = info;
      var modalInstance = $uibModal.open({
        templateUrl: 'js/util/confirm.tpl.html',
        controller:  'MessageInstanceCtrl',
        size:        info.size || 'sm',
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
        size:        info.size,
        backdrop:    info.autoClose ? undefined : 'static',
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

    $scope.$on('evtSelectButton', function (event, info) {
      $scope.info = info;
      var modalInstance = $uibModal.open({
        templateUrl: 'js/util/selectButton.html',
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

    $scope.$on('evtSelectFromList', function (event, info) {
      $scope.info = info;
      var modalInstance = $uibModal.open({
        templateUrl: 'js/util/selectFromList.html',
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

  MessageInstanceCtrl.$inject = ['$scope', '$uibModalInstance', '$timeout', 'info'];

  function MessageInstanceCtrl($scope, $uibModalInstance, $timeout, info) {
    $scope.info = info;

    $scope.fromListActivate = function($select) {
      $timeout(function() { $select.activate(); }, 250);
    };

    $scope.onFromListSelect = function($item, $select) {
      //console.debug("onFromListSelect: ", "$item=", $item, "$select=", $select);
      $uibModalInstance.close(_.indexOf(info.options, $item));
    };

    $scope.ok = function() {
      $uibModalInstance.close();
    };

    if (info.autoClose) {
      $timeout(function() { $uibModalInstance.close(); }, info.autoClose);
    }

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
      selectButton: function (info) {
        $rootScope.$broadcast('evtSelectButton', info);
      },
      selectFromList: function (info) {
        $rootScope.$broadcast('evtSelectFromList', info);
      },
      error: function (info) {
        $rootScope.$broadcast('evtError', info);
      },

      openProgressModal: openProgressModal,

      openRegistrationProgressModal: openRegistrationProgressModal
    };

    function openRegistrationProgressModal(uri, title) {
      return $uibModal.open({
        templateUrl: 'js/util/message.tpl.html',
        controller:  'MessageInstanceCtrl',
        //size:        'sm',
        backdrop:    'static',
        resolve: {
          info: function () {
            return {
              title:   title || "Registering ...",
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

    function openProgressModal(info) {
      return $uibModal.open({
        templateUrl: 'js/util/message.tpl.html',
        controller:  'MessageInstanceCtrl',
        size:        info.size || 'sm',
        backdrop:    'static',
        resolve: {
          info: function () {
            return info;
          }
        }
      });
    }
  }

  // focus http://stackoverflow.com/a/18295416/830737
  focus.$inject = ['$rootScope', '$timeout'];
  function focus($rootScope, $timeout) {
    return function(name, delay, options) {
      //console.debug("focus: name=", name, "delay=", delay, "options=", options);
      $timeout(function (){
        $rootScope.$broadcast('focusOn', name, options);
        }, delay || 0);
    }
  }
  function focusOn() {
    return function(scope, elem, attr) {
      scope.$on('focusOn', function(e, name, options) {
        if(name === attr.focusOn) {
          //console.debug("focusOn: name=", name, "options=", options);
          elem[0].focus();
          if (options && options.select) {
            elem[0].select && elem[0].select();
          }
        }
      });
    };
  }

  /**
   * Adapted from propsFilter in http://plnkr.co/edit/5pWPKGSQfGejuEflDNuF?p=preview
   */
  function orPropsFilter() {
    return function(items, props) {
      if (angular.isArray(items)) {
        var out = [];
        var keys = Object.keys(props);
        items.forEach(function(item) {
          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            var text = props[prop].toLowerCase();
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              out.push(item);
              break;
            }
          }
        });
        return out;
      }
      else return items;
    }
  }

  // http://stackoverflow.com/a/24163343/830737
  focus.$inject = ['$sce'];
  function trustAsResourceUrl($sce) {
    return function(val) {
      return $sce.trustAsResourceUrl(val);
    };
  }

})();
