(function() {
  'use strict';

  angular.module('orrportal.upload', ['ngFileUpload'])
    .controller('UploadController', UploadController)
  ;

  UploadController.$inject = ['$rootScope', '$scope', '$location', 'Upload'];

  function UploadController($rootScope, $scope, $location, Upload) {
    if (appUtil.debug) console.log("++UploadController++");

    if (!$rootScope.userLoggedIn()) {
      $location.url("/");
      return;
    }

    $rootScope.vm.curView = 'rx';

    var vm = {
      name:     '',
      uri:      '',
      orgName:  'mmi',
      userName: $rootScope.masterAuth.loggedInInfo.uid,
      format:   'rdf'
    };
    $scope.vm = vm;

    var url = appConfig.orront.rest + "/api/v0/ont";

    $scope.doUpload = function (file) {
      var data = {
        file:     file,
        format:   vm.format,
        uri:      vm.uri,
        name:     vm.name,
        orgName:  vm.orgName,
        userName: vm.userName
      };

      if ($rootScope.masterAuth.authData && $rootScope.masterAuth.authData.token) {
        console.log("INCLUDING jwt token");
        data.jwt = $rootScope.masterAuth.authData.token;
      }

      Upload.upload({
        url: url,
        data: data
      }).then(function (resp) {
        console.log('Success ' + resp.config.data.file.name + ' uploaded. Response: ', resp);
      }, function (resp) {
        console.log('Error:', resp.status);
      }, function (evt) {
        vm.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        console.log('progress: ' + vm.progressPercentage + '% ' + evt.config.data.file.name);
      });
    };
  }

})();
