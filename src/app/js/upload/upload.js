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

    var userName = $rootScope.masterAuth.loggedInInfo.uid;

    var vm = $scope.vm = {
      name:     '',
      uri:      '',
      formatOptions: [
        { id: '-',       name: '--select--'},
        { id: 'rdf',    name: 'RDF/XML'},
        { id: 'owl',    name: 'OWL/XML'},
        { id: 'n3',     name: 'N3'},
        { id: 'nt',     name: 'N-TRIPLE'},
        { id: 'turtle', name: 'TURTLE'}
      ],
      ownerOptions: [{
          id:    userName,
          name: 'User: ' + userName
          }]
    };
    vm.selectedFormat = vm.formatOptions[0];
    vm.selectedOwner = vm.ownerOptions[0];

    // TODO add organizations that the user can submit ontologies on behalf of
    vm.ownerOptions.push({
      id:   "mmi",
      name: 'Organization: ' + "MMI"
    });
    // TODO properly handle distinction between userName OR organization being submitting (this also involves orr-ont)

    var url = appConfig.orront.rest + "/api/v0/ont";

    $scope.doUpload = function (file) {
      var data = {
        file:     file,
        format:   vm.formatOptions.id,
        uri:      vm.uri,
        name:     vm.name,
        orgName:  vm.selectedOwner.id,
        userName: userName
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
