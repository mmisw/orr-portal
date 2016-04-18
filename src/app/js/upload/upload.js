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

    var userName, vm = {};

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

      vm.possibleOntologies = vm.uploadResponse.data.possibleOntologies || [];

      vm.possibleOntologyUris = _.groupBy(vm.possibleOntologies, "uri");
      //console.log('possibleOntologyUris=', vm.possibleOntologyUris);

      vm.possibleOntologyLabels = uniqValues("label");
      //console.log('possibleOntologyLabels=', vm.possibleOntologyLabels);

      function uniqValues(attrName) {
        return _.chain(vm.possibleOntologies || [])
          .map(attrName)
          .filter(function(v) { return v && v.length > 0 })
          .uniq()
          .value()
      }
    }

    $scope.getPossibleOntologyLabels = function(search) {
      var newList = vm.possibleOntologyLabels.slice();
      if (search && newList.indexOf(search) === -1) {
        newList.unshift(search);
      }
      return newList;
    };

    $scope.uploadAnotherFile = function() {
      vm.uploadResponse = vm.originalUri = undefined;
      vm.selectedOwner = vm.newShortNameEntered = vm.newShortName = undefined;
      vm.knownOwner = undefined;
      vm.checkedNewUriIsAvailable = vm.newUriIsAvailable = undefined;
      vm.name = undefined;
      vm.newUri = undefined;
    };

    $scope.okToRegisterRehosted = function() {
      return (vm.knownOwner || vm.selectedOwner)
          && validUri(vm.originalUri)
        && vm.name;

      function validUri(uri) {
        return uri;  // TODO URI validation
      }
    };

    $scope.doRegisterRehosted = function() {
      var params = {
        uri:      vm.originalUri,
        name:     vm.name,
        orgName:  vm.knownOwner || vm.selectedOwner.id,
        userName: userName,
        uploadedFilename: vm.uploadResponse.data.filename,
        uploadedFormat:   vm.uploadResponse.data.format
      };

      var brandNew = !vm.knownOwner;
      service.registerOntology(brandNew, params, cb);

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
      vm.newShortNameEntered = removeExt(vm.uploadResponse.origFilename);
    };

    $scope.$watch("vm.newShortNameEntered", function(val) {
      if (val) {
        val = removeExt(val);
        val = val.replace(/[^a-z0-9-_]/g, '_');
        vm.newShortName = val;
      }
      else vm.newShortName = '';
      vm.checkedNewUriIsAvailable = vm.newUriIsAvailable = false;
    });
    $scope.$watch("vm.selectedOwner", function() {
      vm.checkedNewUriIsAvailable = vm.newUriIsAvailable = false;
    });

    function removeExt(val) {
      if (val) {
        var idx = val.indexOf('.');
        if (idx >= 0) val = val.substring(0, idx);
      }
      return val;
    }

    $scope.nextPage = function(page) {
      vm.page = page;

      if (vm.page === 2) {
        if (vm.registrationType === 're-hosted') {
          $scope.checkNewUriIsAvailable();
        }
      }
    };

    $scope.backPage = function(page) {
      vm.page = page;
    };

    $scope.okToCheckNewUriIsAvailable = function() {
      if (vm.registrationType === 'fully-hosted') {
        return vm.selectedOwner
          && vm.newShortName && vm.newShortName.match(/^[a-z0-9-_]+$/i)
      }
      else return true;
    };

    $scope.checkNewUriIsAvailable = function() {
      if (vm.registrationType === 'fully-hosted') {
        vm.newUri = cfg.orront.rest + "/" + vm.selectedOwner.id + "/" + vm.newShortName;
      }
      else vm.newUri = vm.originalUri;

      vm.knownOwner = undefined;

      // TODO use more specific endpoint API to do this check
      service.refreshOntology(vm.newUri, gotOntology);

      function gotOntology(error, ontology) {
        vm.checkedNewUriIsAvailable = true;
        if (error) {
          console.log("error getting ontology:", error);
          vm.newUriIsAvailable = true;
        }
        else {
          console.log("got ontology:", ontology);
          vm.name = ontology.name;
          vm.newUriIsAvailable = false;

          vm.knownOwner = ontology.orgName;
        }
      }
    };

    $scope.okToRegisterFullyHosted = function() {
      return vm.checkedNewUriIsAvailable
        && vm.name && vm.name.indexOf('<') < 0
    };

    $scope.doRegisterFullyHosted = function() {
      var params = {
        uri:      vm.newUri,
        name:     vm.name,
        orgName:  vm.selectedOwner.id,
        userName: userName,
        uploadedFilename: vm.uploadResponse.data.filename,
        uploadedFormat:   vm.uploadResponse.data.format
      };

      var brandNew = vm.newUriIsAvailable;
      service.registerOntology(brandNew, params, cb);

      function cb(error, data) {
        if (error) {
          console.error(error)
        }
        else {
          console.log("registerOntology: success data=", data);
          // TODO open dialog about successful registration
          // and with links to go to the new ontology page
          // or the main ORR page
        }
      }
    };
  }

})();
