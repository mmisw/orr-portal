(function() {
  'use strict';

  angular.module('orrportal.upload', ['ngFileUpload'])
    .controller('UploadController', UploadController)
  ;

  UploadController.$inject = ['$rootScope', '$scope', '$location', 'Upload', 'service'];

  function UploadController($rootScope, $scope, $location, Upload, service) {
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
        { id: 'rdf',    name: 'RDF/XML'},
        { id: 'owl',    name: 'OWL/XML'},
        { id: 'n3',     name: 'N3'},
        { id: 'nt',     name: 'N-TRIPLE'},
        { id: 'turtle', name: 'TURTLE'}
      ],
      selectedFormat: undefined,

      // TODO properly handle distinction between userName OR organization (this also involves orr-ont)
      ownerOptions: [{
        id:    userName,
        name: 'User: ' + userName + ": " + $rootScope.masterAuth.loggedInInfo.displayName
      }],
      selectedOwner: undefined
  };

    // add user's organizations:
    service.refreshUser(userName, function(error, user) {
      if (error) {
        console.error("error getting user:", error);
      }
      else {
        console.log("refreshUser: got=", user);
        if (user.organizations) {
          _.each(user.organizations, function(o) {
            vm.ownerOptions.push({
              id: o.orgName,
              name: 'Organization: ' + o.orgName + ": " + o.name
            });
          })
        }
      }
    });

    $scope.doUpload = function (file) {
      vm.uri = vm.name = '';

      var url = appConfig.orront.rest + "/api/v0/ont/upload";
      var data = {
        file:     file,
        format:   vm.selectedFormat.id
      };

      if ($rootScope.masterAuth.authData && $rootScope.masterAuth.authData.token) {
        console.log("INCLUDING jwt token");
        data.jwt = $rootScope.masterAuth.authData.token;
      }

      console.log("upload:", "url=", url, "data=", data);

      Upload.upload({
        url: url,
        data: data
      }).then(function (resp) {
        console.log('Success ' + resp.config.data.file.name + ' uploaded. resp.data:', resp.data);
        vm.uploadResponse = resp.data;
      }, function (resp) {
        console.log('Error:', resp.status);
      }, function (evt) {
        vm.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        //console.log('progress: ' + vm.progressPercentage + '% ' + evt.config.data.file.name);
      });
    };

    $scope.okToRegister = function() {
      return vm.selectedOwner && validUri(vm.uri) && vm.name;

      function validUri(uri) {
        return uri;  // TODO URI validation
      }
    };

    $scope.doRegister = function() {
      var params = {
        uri:      vm.uri,
        name:     vm.name,
        orgName:  vm.selectedOwner.id,
        userName: userName,
        uploadedFilename: vm.uploadResponse.filename,
        uploadedFormat:   vm.uploadResponse.format
      };

      service.registerOntology(params, cb);

      function cb(error, data) {
        if (error) {
          console.error(error)
        }
        else {
          console.log("registerOntology: success data=", data);
        }
      }
    };
  }

})();
