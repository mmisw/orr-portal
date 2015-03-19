(function() {
'use strict';

angular.module('orrportal.org', [])
    .controller('OrgController', OrgController)
;

OrgController.$inject = ['$scope', '$routeParams', 'service'];

function OrgController($scope, $routeParams, service) {
    if (appUtil.debug) console.log("++OrgController++");

    $scope.orgName = $routeParams.orgName;
    $scope.org = undefined;
    $scope.error = undefined;

    refreshOrg($scope, $scope.orgName, service);
}

function refreshOrg($scope, orgName, service) {
    service.refreshOrg(orgName, gotOrg);

    function gotOrg(error, org) {
        if (error) {
            console.log("error getting org:", error);
            $scope.error = error;
        }
        else {
            $scope.org = org;
        }
    }
}

})();
