(function () {
  'use strict';

  angular.module('orrportal.auth.controllers', ['angular-jwt'])
    .controller("MainLoginController", MainLoginController)
    .controller('OrrOntLoginController', OrrOntLoginController)
    .controller('OrrOntResetController', OrrOntResetController)
    .controller('OrrOntRemindUsernameController', OrrOntRemindUsernameController)
    .controller('OrrOntCreateAccountController', OrrOntCreateAccountController)
    .controller('OrrOntAccountController', OrrOntAccountController)
    .controller('OrrOntChangePasswordController', OrrOntChangePasswordController)
  ;

  MainLoginController.$inject = ['$scope', '$uibModal', 'authService'];
  function MainLoginController($scope, $uibModal, authService) {
    $scope.openLoginDialog = function(info) {
      //console.log("MainLoginController.openLoginDialog");
      $uibModal.open({
        templateUrl: 'js/auth/views/orront.login.tpl.html',
        controller:  'OrrOntLoginController',
        size:        'sm',
        backdrop:    'static'
        ,resolve: {
          info: function () {
            return info;
          }
        }
      });
    };

    $scope.createAccount = function () {
      var modalInstance = $uibModal.open({
        templateUrl: 'js/auth/views/orront.create.tpl.html',
        controller:  'OrrOntCreateAccountController',
        backdrop:    'static'
      });
      modalInstance.result.then(function (username) {
        //console.log('orront.create dialog accepted: username=', username);
        $scope.openLoginDialog({userName: username})
      }, function () {});
    };

    $scope.openAccountDialog = function(userName) {
      //console.log("MainLoginController.openLoginDialog");
      $uibModal.open({
        templateUrl: 'js/auth/views/orront.account.tpl.html',
        controller:  'OrrOntAccountController',
        backdrop:    'static',
        resolve: {
          userName: function () {
            return userName;
          }
        }
      });
    };

    $scope.logout = authService.signOut;
  }

  OrrOntLoginController.$inject = [
    '$scope', '$uibModalInstance', '$uibModal', 'authService', 'focus', 'info'];
  function OrrOntLoginController(
    $scope, $uibModalInstance, $uibModal, authService, focus, info
  ) {
    console.debug("=OrrOntLoginController= info=", info);

    var vm = $scope.vm = {
      userName: info && info.userName ? info.userName : "",
      password: ""
    };

    $scope.progress = undefined;
    $scope.error = undefined;

    focus("login_form_activation", 700, {select: true});

    $scope.loginKeyPressed = function($event) {
      if ($event.keyCode == 13) {
        $scope.doLogin();
      }
    };

    $scope.isValid = function() {
      return $scope.vm.userName && $scope.vm.password;
    };

    $scope.doLogin = function() {
      if (!$scope.isValid()) {
        return;
      }

      $scope.error = undefined;

      var body = {
        username: $scope.vm.userName,
        password: $scope.vm.password
      };
      //console.log("Verifying: body=", body);
      $scope.progress = "Verifying...";

      authService.signIn(body.username, body.password, function(error, accountInfo) {
        if (error) {
          console.error("HERE signIn callback error=", error);
          $scope.error = error;
          $scope.progress = undefined;
        }
        else {
          //console.debug("authService.signIn: callback accountInfo=", accountInfo);
          $uibModalInstance.close(accountInfo);
        }
      });
    };

    $scope.resetPassword = function () {
      $uibModal.open({
        templateUrl: 'js/auth/views/orront.reset.tpl.html',
        controller:  'OrrOntResetController',
        backdrop:    'static',
        size:        'sm'
      });
    };

    $scope.remindUsername = function () {
      $uibModal.open({
        templateUrl: 'js/auth/views/orront.remind.username.tpl.html',
        controller:  'OrrOntRemindUsernameController',
        backdrop:    'static',
        size:        'sm'
      });
    };

    $scope.createAccount = function () {
      var modalInstance = $uibModal.open({
        templateUrl: 'js/auth/views/orront.create.tpl.html',
        controller:  'OrrOntCreateAccountController',
        backdrop:    'static'
      });
      modalInstance.result.then(function (username) {
        //console.log('orront.create dialog accepted: username=', username);
        vm.userName = username;
        vm.password = '';
      }, function () {});
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss();
    };
  }

  OrrOntResetController.$inject = ['$scope', '$uibModalInstance', '$http', 'authService', 'cfg', 'focus'];
  function OrrOntResetController($scope, $uibModalInstance, $http, authService, cfg, focus) {

    var vm = $scope.vm = {
      username: "",

      alreadyRequested: []
      // to avoid repeated requests for same username at least during the same modal session
    };

    focus("resetPw_form_activation", 700, {select: true});

    $scope.error = undefined;

    $scope.isValid = function() {
      return vm.username && _.indexOf(vm.alreadyRequested, vm.username) < 0
        && !$scope.working;
    };

    $scope.doReset = function() {
      if (!$scope.isValid()) {
        return;
      }

      $scope.error = undefined;
      $scope.working = true;
      $scope.status = "Resetting...";

      $http({
        method:  'PUT',
        url:     cfg.orront.rest + "/api/v0/user/rpwr/" + vm.username,
      })
        .success(function(data, status, headers, config) {
          $scope.working = false;
          console.log("request password reset response:", data);
          vm.alreadyRequested.push(vm.username);
          $scope.status = data.message;
          authService.signOut();
        })
        .error(function(data, status, headers, config) {
          $scope.working = false;
          console.error("request password reset error: data=", data, "status=", status);
          $scope.error = data.error ? data.error : "error: " + angular.toJson(data);
          $scope.status = undefined;
        });
    };

    $scope.close = function() {
      $uibModalInstance.dismiss();
    };
  }

  OrrOntRemindUsernameController.$inject = ['$scope', '$uibModalInstance', '$http', 'cfg', 'focus'];
  function OrrOntRemindUsernameController($scope, $uibModalInstance, $http, cfg, focus) {

    var vm = $scope.vm = {
      email: "",

      error: "",
      working: false,
      reminded: false
    };

    focus("remindUsername_form_activation", 700, {select: true});

    $scope.isValid = function() {
      return vm.email && !$scope.working;
    };

    $scope.doRemind = function() {
      if (!$scope.isValid()) {
        return;
      }

      vm.error = undefined;
      vm.working = true;
      vm.status = "Submitting...";

      $http({
        method:  'PUT',
        url:     cfg.orront.rest + "/api/v0/user/unr/",
        data:    {email: vm.email}
      })
        .success(function(data, status, headers, config) {
          vm.working = false;
          console.log("request username reminder response:", data);
          vm.status = data.message;
          vm.reminded = true;
        })
        .error(function(data, status, headers, config) {
          vm.working = false;
          console.error("request username reminder error: data=", data, "status=", status);
          vm.error = data.error ? data.error : "error: " + angular.toJson(data);
          vm.status = undefined;
        });
    };

    $scope.close = function() {
      $uibModalInstance.dismiss();
    };
  }

  OrrOntCreateAccountController.$inject = ['$scope', '$uibModalInstance', '$http', 'cfg', 'focus'];
  function OrrOntCreateAccountController($scope, $uibModalInstance, $http, cfg, focus) {

    var vm = $scope.vm = {
      recaptcha: cfg.recaptcha,
      recaptchaResponse: '',

      username: "",
      firstName: "",
      lastName: "",
      email: "",
      email2: "",
      phone: "",
      password: "",
      password2: "",

      creating: true,
      created: false
    };

    focus("createAccount_form_activation", 700, {select: true});

    $scope.$watch("vm.username", function(val) {
      vm.username = val.replace(/^[_\.-]+/, "").replace(/[^a-z0-9_\.-]/gi, "").toLowerCase();
    });

    vm.error = undefined;

    $scope.isValid = function() {
      if ($scope.working) return false;
      if (!vm.username) return false;
      if (!vm.firstName) return false;
      if (!vm.lastName) return false;
      if (!vm.email) return false;
      if (vm.email !== vm.email2) return false;
      if (!vm.phone) return false;
      if (!vm.password) return false;
      if (vm.password !== vm.password2) return false;
      if (vm.recaptcha && vm.recaptcha.siteKey && !vm.recaptchaResponse) return false;

      return true;
    };

    $scope.doCreate = function() {
      if (!$scope.isValid()) {
        return;
      }

      vm.error = undefined;
      vm.working = true;
      vm.status = "Creating...";

      var body = {
        userName:   vm.username,
        email:      vm.email,
        email2:     vm.email2,
        firstName:  vm.firstName,
        lastName:   vm.lastName,
        phone:      vm.phone,
        password:   vm.password,
        recaptchaResponse: vm.recaptchaResponse
      };

      $http({
        method:  'POST',
        url:     cfg.orront.rest + "/api/v0/user/",
        data:    body
      })
        .success(function(data, status, headers, config) {
          vm.working = false;
          vm.created = true;
          vm.creating = false;
          console.log("request create account response:", data);
          vm.status = '';  // ok creation msg shown in the heading
        })
        .error(function(data, status, headers, config) {
          vm.working = false;
          console.error("request create account error: data=", data, "status=", status);
          vm.error = data.error ? data.error : "error: " + angular.toJson(data);
          vm.status = undefined;
        });
    };

    $scope.close = function() {
      if(vm.created)
        $uibModalInstance.close(vm.username);
      else
        $uibModalInstance.dismiss();
    };
  }

  OrrOntAccountController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$uibModal', '$http', 'service', 'userName', 'cfg'];
  function OrrOntAccountController($rootScope, $scope, $uibModalInstance, $uibModal, $http, service, userName, cfg) {

    var savedUser = {};

    var vm = $scope.vm = {
      username: userName,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",

      status: "",
      error: ""
    };

    $scope.resetAccountInfo = resetAccountInfo;

    resetAccountInfo();

    function resetAccountInfo() {
      vm.working = true;
      vm.status = "retrieving";

      service.refreshUser(userName, gotUser);

      function gotUser(error, user) {
        if (error) {
          vm.working = false;
          $scope.error = error;
          console.log("error getting user:", error);
        }
        else {
          vm.working = false;
          vm.status = "";
          _.assign(savedUser, user);
          _.assign(vm, user);
          console.log("gotUser=", user);
        }
      }
    }

    $scope.modified = function() {
      return savedUser.firstName !== vm.firstName
          || savedUser.lastName !== vm.lastName
          || savedUser.phone !== vm.phone
      ;
    };

    $scope.isValid = function() {
      if ($scope.working) return false;
      if (!vm.username) return false;
      if (!vm.firstName) return false;
      if (!vm.lastName) return false;
      if (!vm.phone) return false;

      return true;
    };

    $scope.saveAccountInfo = function() {
      if (!$scope.isValid()) {
        return;
      }

      vm.error = undefined;
      vm.working = true;
      vm.status = "Updating...";

      var url = cfg.orront.rest + "/api/v0/user/" + vm.username;

      var params = [];
      addJwtIfAvailable($rootScope.rvm, params);
      if (params.length > 0) { url += "?" + params.join('&'); }

      var body = {
        firstName: vm.firstName,
        lastName:  vm.lastName,
        phone:     vm.phone
      };

      $http({
        method:  'PUT',
        url:     url,
        data:    body
      })
        .success(function(data, status, headers, config) {
          console.log("save account info response:", data);
          vm.working = false;
          vm.status = "saved.";
          savedUser = _.clone(vm);
        })
        .error(function(data, status, headers, config) {
          vm.working = false;
          console.error("save account info error: data=", data, "status=", status);
          vm.error = data.error ? data.error : "error: " + angular.toJson(data);
          vm.status = undefined;
        });
    };

    $scope.changePassword = function() {
      var modalInstance = $uibModal.open({
        templateUrl: 'js/auth/views/orront.changepw.tpl.html',
        controller:  'OrrOntChangePasswordController',
        backdrop:    'static',
        resolve: {
          accountInfo: function () {
            return vm;
          }
        }
      });
      modalInstance.result.then($uibModalInstance.close);
    };

    $scope.close = function() {
      $uibModalInstance.dismiss();
    };

  }

  OrrOntChangePasswordController.$inject = ['$rootScope', '$scope', '$uibModalInstance', '$http', '$timeout', 'cfg', 'accountInfo', 'authService'];
  function OrrOntChangePasswordController($rootScope, $scope, $uibModalInstance, $http, $timeout, cfg, accountInfo, authService) {

    var vm = $scope.vm = {
      username: accountInfo.userName,
      email:    accountInfo.email,

      password: "",
      password2: "",

      status: "",
      error: "",

      changed: false
    };

    $scope.isValid = function() {
      if ($scope.working) return false;

      // TODO real password validation!
      if (!vm.password) return false;
      if (vm.password !== vm.password2) return false;

      return true;
    };

    $scope.doSavePassword = function() {
      if (!$scope.isValid()) {
        return;
      }

      vm.error = undefined;
      vm.working = true;
      vm.status = "Saving...";

      var url = cfg.orront.rest + "/api/v0/user/" + vm.username;

      var params = [];
      addJwtIfAvailable($rootScope.rvm, params);
      if (params.length > 0) { url += "?" + params.join('&'); }

      var body = {
        password:  vm.password
      };

      $http({
        method:  'PUT',
        url:     url,
        data:    body
      })
        .success(function(data, status, headers, config) {
          vm.working = false;
          console.log("save password response:", data);
          vm.status = 'Password changed. Please log in again.';
          vm.changed = true;
          authService.signOut();
          $timeout(function(){
            $uibModalInstance.close();
          }, 2000)
        })
        .error(function(data, status, headers, config) {
          vm.working = false;
          console.error("request create account error: data=", data, "status=", status);
          vm.error = data.error ? data.error : "error: " + angular.toJson(data);
          vm.status = undefined;
        });
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss();
    };
  }

  function addJwtIfAvailable(rvm, params) {
    if (rvm.accountInfo && rvm.accountInfo.token) {
      params.push("jwt=" + rvm.accountInfo.token);
    }
  }

})();
