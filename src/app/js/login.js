(function() {
'use strict';

angular.module('orrportal.login', [])
    .controller('LoginController', LoginController)
;

LoginController.$inject = ['$scope', '$routeParams', '$location', 'service'];

function LoginController($scope, $routeParams, $location, service) {
    if (appUtil.debug) console.log("++LoginController++");

    $scope.redirect = $routeParams.redirect;
    $scope.vm = {
        userName: "",
        password: ""
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
        service.signIn($scope.vm.userName, $scope.vm.password, gotLogin);

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
