(function () {
  'use strict';

  angular.module('orrportal.firebase', ['firebase'])
    .factory('fireData', fireData)
    .factory('fireAuth', fireAuth)
    .controller("MainLoginController", MainLoginController)
    .controller("FireClientController", FireClientController)
    .controller('OrrOntLoginController', OrrOntLoginController)
    .controller('FireLoginController', FireLoginController)
    .controller('FireCreateController', FireCreateController)
    .controller('FireResetController', FireResetController)
  ;

  fireData.$inject = ['cfg', '$firebaseObject'];
  function fireData(cfg, $firebaseObject) {
    return {
      users:   $firebaseObject(new Firebase(cfg.firebase.url + "/users")),
      logins:  $firebaseObject(new Firebase(cfg.firebase.url + "/logins"))
    };
  }

  fireAuth.$inject = ['$rootScope', '$location', '$route', '$firebaseAuth', 'fireData', 'service', 'cfg'];
  function fireAuth($rootScope, $location, $route, $firebaseAuth, fireData, service, cfg) {
    var ref = new Firebase(cfg.firebase.url);
    var auth = $firebaseAuth(ref);
    var masterAuth = $rootScope.masterAuth;

    auth.$onAuth(authenticateStateChanged);

    return {
      auth: auth,
      login: function(provider) {
        var scope = provider === 'github' ? 'user:email' : 'email';
        auth.$authWithOAuthPopup(provider, {scope: scope});
      },
      customLogin: function(token) {
        var options = {};
        console.log("doing custom log in...");
        auth.$authWithCustomToken(token, options).then(function(authData) {
          console.log("custom Logged in. authData=", authData);
        }).catch(function(error) {
          console.error("Custom Authentication failed:", error);
        });
      },

      logout: auth.$unauth
    };

    function authenticateStateChanged(authData) {
      console.log(appUtil.logTs() + ": authenticateStateChanged: authData=", authData);

      updateMasterAuth(authData);
      updateFirebase();
      updateUI();

      function updateMasterAuth(authData) {
        //console.log("authData=", authData);
        masterAuth.authData = authData;
        masterAuth.loggedInInfo = getUserInfo(authData);

        function getUserInfo(authData) {
          if (authData) {
            if (authData.auth && authData.auth[authData.provider]) {
              var provData = authData.auth[authData.provider];
            }
            else {
              provData = authData[authData.provider];
            }
            var userInfo = {
              provider: authData.provider,
              uid: authData.uid
            };
            if (provData.displayName) {
              userInfo.displayName = provData.displayName;
            }
            if (provData.username) {
              userInfo.username = provData.username;
            }
            if (provData.email) {
              userInfo.email = provData.email;
            }
            return userInfo;
          }
        }
      }

      function updateFirebase() {
        if(masterAuth.loggedInInfo && masterAuth.loggedInInfo.uid) {
          var uid = masterAuth.loggedInInfo.uid;
          console.log("userHasLoggedIn uid=", uid);
          var obj = _.omit(masterAuth.loggedInInfo, 'uid');
          // update users:
          fireData.users.$loaded().then(function() {
            fireData.users[uid] = obj;
            fireData.users.$save().then(function() {
              console.log("saved logged in user", masterAuth.loggedInInfo);
              //$modalInstance.dismiss();
            }).catch(function(error) {
              console.error("error saving logged in user", error);
              //$modalInstance.dismiss();
            });
          }).catch(function(error) {
            console.error("error loading users", error);
            //$modalInstance.dismiss();
          });
          // update logins:
          var lastLogin = {
            date: moment().toISOString(),
            origin: $location.absUrl()
          };
          fireData.logins.$loaded().then(function() {
            fireData.logins[uid] = {lastLogin: lastLogin};
            fireData.logins.$save().then(function() {
              console.log("saved login", masterAuth.loggedInInfo)
            }).catch(function(error) {
              console.error("error saving login", error)
            });
          }).catch(function(error) {
            console.error("error loading logins", error);
            //$modalInstance.dismiss();
          });
        }
      }

      function updateUI() {
        service.setDoRefreshOntologies(true);
        $route.reload();
      }
    }
  }

  MainLoginController.$inject = ['$scope', '$uibModal', 'fireAuth'];
  function MainLoginController($scope, $uibModal, fireAuth) {
    $scope.openLoginDialog = function() {
      //console.log("MainLoginController.openLoginDialog");
      $uibModal.open({

        // directly to the orr-ont login dialog:
        templateUrl: 'js/fireauth/views/orront.login.tpl.html',
        controller:  'OrrOntLoginController',
        size:        'sm',

        // as a basis for a future version, modal with multiple options
        // (orr-ont; firebase(password db); google, github...)
        //templateUrl: 'js/fireauth/views/main.modal.tpl.html',
        //controller:  'FireClientController',

        backdrop:    'static'
      });
    };

    $scope.logout = fireAuth.logout;
  }

  FireClientController.$inject = ['$scope', '$uibModal', 'cfg', 'fireAuth'];
  function FireClientController($scope, $uibModal, cfg, fireAuth) {
    //console.log("=FireClientController=");

    $scope.cfg = cfg;

    $scope.login = function (provider) {
      fireAuth.login(provider);
    };

    $scope.logout = fireAuth.logout;

    $scope.openCustomLogin = function () {
      $uibModal.open({
        templateUrl: 'js/fireauth/views/orront.login.tpl.html',
        controller:  'OrrOntLoginController',
        backdrop:    'static',
        size:        'sm'
      });
    };

    $scope.openFireLogin = function () {
      $uibModal.open({
        templateUrl: 'js/fireauth/views/firelogin.tpl.html',
        controller:  'FireLoginController',
        backdrop:    'static',
        size:        'sm'
      });
    };
  }

  OrrOntLoginController.$inject = ['$scope', '$modalInstance', '$http', 'fireAuth', 'cfg'];
  function OrrOntLoginController($scope, $modalInstance, $http, fireAuth, cfg) {
    console.log("=OrrOntLoginController=");

    $scope.vm = {
      userName: "",
      password: ""
    };

    $scope.progress = undefined;
    $scope.error = undefined;

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

      $http({
        method:  'POST',
        url:     cfg.orront.rest + "/api/v0/fb/auth",
        data:    body
      })
        .success(function(data, status, headers, config) {
          console.log("custom auth response:", data);
          fireAuth.customLogin(data.token);
          $modalInstance.close(data);
        })
        .error(function(data, status, headers, config) {
          console.error("custom auth error: data=", data, "status=", status);
          $scope.error = data.error ? data.error : "error: " + angular.toJson(data);
          $scope.progress = undefined;
        });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss();
    };
  }

  FireLoginController.$inject = ['$scope', '$modalInstance', '$uibModal', 'fireAuth'];
  function FireLoginController($scope, $modalInstance, $uibModal, fireAuth) {

    $scope.vm = {
      email: "",
      password: ""
    };

    $scope.progress = undefined;
    $scope.error = undefined;

    $scope.loginKeyPressed = function($event) {
      if ($event.keyCode == 13) {
        $scope.doLogin();
      }
    };

    $scope.isValid = function() {
      return $scope.vm.email && $scope.vm.password;
    };

    $scope.doLogin = function() {
      if (!$scope.isValid()) {
        return;
      }

      $scope.error = undefined;
      $scope.progress = "Verifying...";

      fireAuth.auth.$authWithPassword({
        email    : $scope.vm.email,
        password : $scope.vm.password
      }).then(function(authData) {
        console.log("fire login ok:", authData);
        $modalInstance.close(authData);
      }).catch(function(error) {
        console.log("fire login error:", error);
        $scope.error = error;
        $scope.progress = undefined;
      });
    };

    $scope.createFireAccount = function () {

      var modalInstance = $uibModal.open({
        templateUrl: 'js/fireauth/views/firecreate.tpl.html',
        controller:  'FireCreateController',
        backdrop:    'static',
        size:        'sm'
      });

      modalInstance.result.then(function (result) {
        console.log('login dialog accepted:', result);
      }, function () {
      });
    };

    $scope.resetPassword = function () {
      $uibModal.open({
        templateUrl: 'js/fireauth/views/firereset.tpl.html',
        controller:  'FireResetController',
        backdrop:    'static',
        size:        'sm'
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss();
    };
  }

  FireCreateController.$inject = ['$scope', '$modalInstance', 'fireAuth'];
  function FireCreateController($scope, $modalInstance, fireAuth) {

    $scope.vm = {
      email: "",
      password: ""
    };

    $scope.progress = undefined;
    $scope.error = undefined;

    $scope.loginKeyPressed = function($event) {
      if ($event.keyCode == 13) {
        $scope.doCreate();
      }
    };

    $scope.isValid = function() {
      return $scope.vm.email && $scope.vm.password;
    };

    $scope.doCreate = function() {
      if (!$scope.isValid()) {
        return;
      }

      $scope.error = undefined;

      $scope.progress = "Creating...";

      var user = {
        email    : $scope.vm.email,
        password : $scope.vm.password
      };
      console.log("fire creating user:", user);
      fireAuth.auth.$createUser(user).then(function(userData) {
        console.log("fire user created ok:", userData);
        $modalInstance.close(userData);
      }).catch(function(error) {
        console.log("fire user creation error:", error);
        $scope.error = error;
        $scope.progress = undefined;
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss();
    };
  }

  FireResetController.$inject = ['$scope', '$modalInstance', 'fireAuth'];
  function FireResetController($scope, $modalInstance, fireAuth) {

    $scope.vm = {
      email: ""
    };

    $scope.progress = undefined;
    $scope.error = undefined;

    $scope.isValid = function() {
      return $scope.vm.email;
    };

    $scope.doReset = function() {
      if (!$scope.isValid()) {
        return;
      }

      $scope.error = undefined;
      $scope.progress = "Resetting...";

      fireAuth.auth.$resetPassword({
        email    : $scope.vm.email
      }).then(function() {
        console.log("fire reset password ok");
        $modalInstance.close();
      }).catch(function(error) {
        console.log("fire reset password error:", error);
        $scope.error = error;
        $scope.progress = undefined;
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss();
    };
  }

})();
