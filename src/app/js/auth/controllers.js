(function() {
'use strict';

angular.module('orrportal.login', ['orrportal.auth'])
    .controller('LoginController', LoginController)
;

LoginController.$inject = ['$scope', '$routeParams', '$location', 'service', 'authService'];

function LoginController($scope, $routeParams, $location, service, authService) {
    if (appUtil.debug) console.log("++LoginController++");

    $scope.redirect = $routeParams.redirect;

    // already signed in?
    if ($scope.loginInfo && $scope.loginInfo.userName) {
        doRedirect();
        return;
    }

    $scope.vm = {
        userName: "",
        password: "",
        rememberMe: false
    };

    $scope.progress = undefined;
    $scope.error = undefined;
    $scope.$watch("vm", function() {
        $scope.progress = undefined;
        $scope.error = undefined;
    }, true);

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
        $scope.progress = "Verifying...";
        authService.signIn($scope.vm, gotLogin);

        function gotLogin(error, loginInfo) {
            $scope.progress = undefined;
            if (error) {
                console.log("error with signIn:", error);
                $scope.error = "Invalid credentials";
            }
            else {
                if (loginInfo.userName === $scope.vm.userName) {
                    service.setDoRefreshOntologies(true);
                    _.assign($scope.loginInfo, loginInfo);
                    doRedirect();
                }
            }
        }
    };

    $scope.cancelLogin = function() {
        var redir = $scope.redirect;
        if (redir && !redir.startsWith("signIn")) {
            $location.url(redir.startsWith("/") ? "" : "/" + redir);
        }
        else {
            $location.url("/");
        }
    };

    function doRedirect() {
        var redirect = $scope.redirect;
        if (redirect) {
            $location.url(redirect.startsWith("/") ? "" : "/" + redirect);
        }
        else {
            $location.url("/");
        }
    }
}

})();
