(function() {
'use strict';

angular.module('orrportal.login', ['orrportal.auth'])
    .controller('LoginController', LoginController)
;

LoginController.$inject = ['$scope', '$routeParams', '$location', 'service', 'authService'];

function LoginController($scope, $routeParams, $location, service, authService) {
    if (appUtil.debug) console.log("++LoginController++");

    $scope.redirect = $routeParams.redirect;
    $scope.vm = {
        userName: "",
        password: "",
        rememberMe: false
    };
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
        authService.signIn($scope.vm, gotLogin);

        function gotLogin(error, loginInfo) {
            if (error) {
                console.log("error with signIn:", error);
                $scope.error = error;
            }
            else {
                if (loginInfo.userName === $scope.vm.userName) {
                    service.setDoRefreshOntologies(true);
                    _.assign($scope.loginInfo, loginInfo);
                    var redir = $scope.redirect;
                    if (redir) {
                        $location.url(redir.startsWith("/") ? "" : "/" + redir);
                    }
                    else {
                        $location.url("/");
                    }
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
}

})();
