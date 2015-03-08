(function() {
'use strict';

angular.module('orrportal.user', [])
    .controller('UserController', UserController)
;

UserController.$inject = ['$scope', '$routeParams', 'service'];

function UserController($scope, $routeParams, service) {
    if (appUtil.debug) console.log("++UserController++");

    $scope.userName = $routeParams.userName;
    $scope.user = undefined;
    $scope.error = undefined;

    refreshUser($scope, $scope.userName, service);
}

function refreshUser($scope, userName, service) {
    service.refreshUser(userName, gotUser);

    function gotUser(error, user) {
        if (error) {
            console.log("error getting user:", error);
            $scope.error = error;
        }
        else {
            //console.log("gotUser=", user);
            $scope.user = user;
        }
    }
}

})();
