(function() {
  'use strict';

  angular.module('orrportal.upload', ['ngFileUpload'])
    .controller('UploadController', UploadController)
    .directive('orrportalUploadOntology', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/upload/views/0-upload.tpl.html'
      }
    })
    .directive('orrportalSelectRegistrationType', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/upload/views/1-regtype.tpl.html'
      }
    })
    .directive('orrportalUploadRehosted', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/upload/views/2-rehosted.tpl.html'
      }
    })
    .directive('orrportalUploadFullyHosted', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/upload/views/2-fullyhosted.tpl.html'
      }
    })
  ;

  var formatOptions = [
    { id: 'rdf',    name: 'RDF/XML'},
    { id: 'owl',    name: 'OWL/XML'},
    { id: 'n3',     name: 'N3'},
    { id: 'nt',     name: 'N-TRIPLE'},
    { id: 'turtle', name: 'TURTLE'}
  ];

  UploadController.$inject = ['$rootScope', '$scope', '$timeout', '$location', 'Upload', 'cfg', 'service'];

  function UploadController($rootScope, $scope, $timeout, $location, Upload, cfg, service) {
    if (appUtil.debug) console.log("++UploadController++");

    var userName, vm;

    if (!$rootScope.userLoggedIn()) {  // wait for a bit
      $timeout(function() {
        if (!$rootScope.userLoggedIn()) {
          $location.url("/");
        }
        else enableController();
      }, 2000);
    }
    else enableController();

    function enableController() {
      $rootScope.vm.curView = 'rx';

      userName = $rootScope.masterAuth.loggedInInfo.uid;

      vm = $scope.vm = {
        name:     '',

        formatOptions: formatOptions,
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
        if (error) { console.error("error getting user:", error); }
        else {
          //console.log("refreshUser: got=", user);
          _.each(user.organizations, function(o) {
            vm.ownerOptions.push({
              id: o.orgName,
              name: 'Organization: ' + o.orgName + ": " + o.name
            });
          })
        }
      });
    }

    $scope.doUpload = function (file) {
      vm.name = '';

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
      }).then(gotUploadResponse,
        function(resp) { console.log('Error:', resp.status);
      },
        function(evt) { vm.progressPercentage = parseInt(100.0 * evt.loaded / evt.total); }
      );
    };

    function gotUploadResponse(resp) {
      console.log('gotUploadResponse:', resp.config.data.file.name, 'uploaded. resp:', resp);
      vm.uploadResponse = {
        origFilename: resp.config.data.file.name,
        data:         resp.data
      };
      $scope.possibleOntologyUris = _.uniq(_.map(vm.uploadResponse.data.possibleOntologies, "uri")) || [];
      $scope.possibleOntologyLabels = _.uniq(_.map(vm.uploadResponse.data.possibleOntologies, "label")) || [];
      //console.log('possibleOntologyUris=', $scope.possibleOntologyUris);
      //console.log('possibleOntologyLabels=', $scope.possibleOntologyLabels);
    }

    $scope.getPossibleOntologyUris = function(search) {  // http://stackoverflow.com/a/32914532/830737
      var newList = $scope.possibleOntologyUris.slice();
      if (search && newList.indexOf(search) === -1) {
        newList.unshift(search);
      }
      return newList;
    };
    $scope.getPossibleOntologyLabels = function(search) {
      var newList = $scope.possibleOntologyLabels.slice();
      if (search && newList.indexOf(search) === -1) {
        newList.unshift(search);
      }
      return newList;
    };

    $scope.okToRegisterRehosted = function() {
      return vm.selectedOwner && validUri(vm.originalUri) && vm.name;

      function validUri(uri) {
        return uri;  // TODO URI validation
      }
    };

    $scope.doRegisterRehosted = function() {
      var params = {
        uri:      vm.originalUri,
        name:     vm.name,
        orgName:  vm.selectedOwner.id,
        userName: userName,
        uploadedFilename: vm.uploadResponse.data.filename,
        uploadedFormat:   vm.uploadResponse.data.format
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

    ////////////////////
    // Fully hosted
    ////////////////////


    $scope.shortNameFromFileName = function() {
      vm.newShortName = vm.uploadResponse.origFilename;
      var dotIdx = vm.newShortName.lastIndexOf('.');
      if (dotIdx >= 0) vm.newShortName = vm.newShortName.substring(0, dotIdx);
    };

    $scope.okToRegisterFullyHosted = function() {
      return vm.selectedOwner && vm.newShortName && vm.name;
    };

    $scope.doRegisterFullyHosted = function() {
      var params = {
        uri:      vm.originalUri,
        name:     vm.name,
        orgName:  vm.selectedOwner.id,
        userName: userName,
        uploadedFilename: vm.uploadResponse.data.filename,
        uploadedFormat:   vm.uploadResponse.data.format
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
