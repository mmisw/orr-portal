(function() {
  'use strict';

  angular.module('orrportal.upload', ['ngFileUpload'])
    .controller('UploadController', UploadController)
    .directive('orrportalUploadOntology', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/upload/upload.html'
      }
    })
    .directive('orrportalUploadUriConfirmed', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/upload/uri-confirmed.html'
      }
    })
    .directive('orrportalSelectRegistrationType', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/upload/regtype.html'
      }
    })
    .directive('orrportalUploadRehosted', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/upload/rehosted.html'
      }
    })
    .directive('orrportalUploadFullyHosted', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/upload/fullyhosted.html'
      }
    })
  ;

  var possibleNamePropertyUris = [
    "http://www.w3.org/2000/01/rdf-schema#label",
    "http://omv.ontoware.org/2005/05/ontology#name",
    "http://purl.org/dc/terms/title",
    "http://purl.org/dc/elements/1.1/title",
    "http://purl.org/dc/elements/1.0/title"
  ];

  UploadController.$inject = ['$rootScope', '$scope', '$timeout', '$location', '$window', 'Upload', 'cfg', 'service', 'utl'];

  function UploadController($rootScope, $scope, $timeout, $location, $window, Upload, cfg, service, utl) {
    if (appUtil.debug) console.log("++UploadController++");

    var userName, vm = {};

    // TODO use ui-router instead of the following hacky logic
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
      $rootScope.rvm.curView = 'rx';

      userName = $rootScope.rvm.masterAuth.loggedInInfo.uid;

      vm = $scope.vm = {
        name:     '',

        prefixFullyHosted: appUtil.windowBareHref + '/',

        maxUploadSize: '10MB',  // TODO retrieve this limit from the backend

        ownerOptions: [{
          id:    '~' + userName,
          name: 'User: ' + userName + ": " + $rootScope.rvm.masterAuth.loggedInInfo.displayName
        }],
        selectedOwner: undefined,

        visibilityOptions: [
          {
            value:  'owner',
            name:   'Visible only to owner (user or members of indicated organization)'
          }, {
            value:  'public',
            name:   'Public'
          }
        ],
        selectedVisibility: undefined
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

    $scope.$watch("vm.originalUri", function(val) {  // avoid pipe character
      if (val) {
        $scope.vm.originalUri = val.replace(/\|/g, "");
      }
    });
    $scope.$watch("vm.name", function(val) {
      if (val) {
        $scope.vm.name = val.replace(/(<|>)/g, "");
      }
    });

    $scope.doUpload = function (file) {
      vm.name = '';

      var url = appConfig.orront.rest + "/api/v0/ont/upload";
      var data = {
        file:     file,
        format:   '_guess'
      };

      if ($rootScope.rvm.masterAuth.authData && $rootScope.rvm.masterAuth.authData.token) {
        console.log("INCLUDING jwt token");
        data.jwt = $rootScope.rvm.masterAuth.authData.token;
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
      console.log('possibleOntologyUris=', vm.uploadResponse.data.possibleOntologyUris);

      vm.possibleOntologyUris = undefined;
      vm.possibleOntologyNames = undefined;

      if (!_.isEmpty(vm.uploadResponse.data.possibleOntologyUris)) {
        vm.possibleOntologyUris = vm.uploadResponse.data.possibleOntologyUris;
        vm.possibleOntologyNames = possibleOntNames();
        //console.log('possibleOntologyNames=', vm.possibleOntologyNames);
      }

      function possibleOntNames() {
        var possibleNames = {};  // propertyValue -> [propertyUri's...]

        // TODO should only be for the selected ontology URI
        // for now, collecting from all possible ontologies:
        _.each(vm.possibleOntologyUris, function(info, possibleOntologyUri) {
          _.each(possibleNamePropertyUris, function(namePropUri) {
            var nameValues = info.metadata[namePropUri];
            _.each(nameValues, function (propertyValue) {
              if (possibleNames[propertyValue] === undefined) {
                possibleNames[propertyValue] = [];
              }
              possibleNames[propertyValue].push(namePropUri);
            });
          });
        });
        return possibleNames;
      }
    }

    $scope.uploadAnotherFile = function() {
      vm.uploadResponse = vm.originalUri = undefined;
      vm.selectedOwner = vm.newShortName = undefined;
      vm.selectedVisibility = undefined;
      vm.knownOwner = undefined;
      vm.userCanRegisterNewVersion = getUserCanRegisterNewVersion();
      vm.checkedNewUriIsAvailable = vm.newUriIsAvailable = undefined;
      vm.name = undefined;
      vm.newUri = undefined;
    };

    $scope.okToRegisterRehosted = function() {
      return (vm.knownOwner || vm.selectedOwner)
          && validUri(vm.originalUri)
        && vm.name
        && vm.selectedVisibility;

      function validUri(uri) {
        return uri;  // TODO URI validation
      }
    };

    $scope.doRegisterRehosted = function() {
      var params = {
        uri:      vm.originalUri,
        name:     vm.name,
        userName: userName,
        uploadedFilename: vm.uploadResponse.data.filename,
        uploadedFormat:   vm.uploadResponse.data.format,
        visibility:       vm.selectedVisibility
      };
      if (vm.knownOwner && !vm.knownOwner.startsWith("~")) {
        params.orgName = vm.knownOwner;
      }

      var brandNew = !vm.knownOwner;
      var progressModal = utl.openRegistrationProgressModal(params.uri);
      service.registerOntology(brandNew, params, registrationCallback(params.uri, progressModal));
    };

    ////////////////////
    // Fully hosted
    ////////////////////


    $scope.shortNameFromFileName = function() {
      vm.newShortName = cleanShortName(vm.uploadResponse.origFilename);
    };

    $scope.$watch("vm.newShortName", function(val) {
      if (val) {
        vm.newShortName = cleanShortName(val);
      }
      else vm.newShortName = '';
      vm.checkedNewUriIsAvailable = vm.newUriIsAvailable = false;
    });
    $scope.$watch("vm.selectedOwner", function() {
      if (vm.registrationType !== 're-hosted') {
        vm.checkedNewUriIsAvailable = vm.newUriIsAvailable = false;
      }
    });

    function cleanShortName(val) {
      function removeExt(val) {
        var idx = val.indexOf('.');
        return idx >= 0 ? val.substring(0, idx) : val;
      }
      if (val) {
        val = removeExt(val).replace(/^[^a-z0-9]+/i, "").replace(/[^a-z0-9_-]/gi, "");
      }
      return val;
    }

    $scope.nextPage = function(page) {
      vm.page = page;

      if (vm.page === 'regtype-selected') {
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
        return vm.selectedOwner && vm.newShortName;
      }
      else return true;
    };

    $scope.checkNewUriIsAvailable = function() {
      if (vm.registrationType === 'fully-hosted') {
        vm.newUri = appUtil.windowBareHref + "/" + vm.selectedOwner.id + "/" + vm.newShortName;
      }
      else vm.newUri = vm.originalUri;

      vm.selectedVisibility = undefined;
      vm.knownOwner = undefined;
      vm.userCanRegisterNewVersion = getUserCanRegisterNewVersion();

      // TODO use more specific endpoint API to do this check
      service.refreshOntology(vm.newUri, null, gotOntology);

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

          vm.selectedVisibility = ontology.visibility;

          vm.knownOwner = ontology.ownerName;
          vm.userCanRegisterNewVersion = getUserCanRegisterNewVersion();
        }
      }
    };

    function getUserCanRegisterNewVersion() {
      if (!vm.knownOwner) {
        return true;
      }
      if (vm.knownOwner.startsWith("~")) {
        console.debug("owned by user:", vm.knownOwner);
        var userOntOwner = vm.knownOwner.substring(1);
        return $rootScope.rvm.masterAuth.loggedInInfo.uid === userOntOwner;
      }
      var orgOntOwner = vm.knownOwner;
      console.debug("owned by org:", orgOntOwner);
      var organizations = $rootScope.rvm.masterAuth.organizations;
      return organizations && _.contains(_.map(organizations, "name"), orgOntOwner);
    }

    $scope.okToRegisterFullyHosted = function() {
      return vm.checkedNewUriIsAvailable
        && vm.name && vm.name.indexOf('<') < 0
        && vm.selectedVisibility
    };

    $scope.doRegisterFullyHosted = function() {
      var params = {
        uri:              vm.newUri,
        originalUri:      vm.originalUri,
        name:             vm.name,
        userName:         userName,
        uploadedFilename: vm.uploadResponse.data.filename,
        uploadedFormat:   vm.uploadResponse.data.format,
        visibility:       vm.selectedVisibility
      };

      if (!vm.selectedOwner.id.startsWith("~")) {
        params.orgName = vm.knownOwner;
      }
      var brandNew = vm.newUriIsAvailable;
      var progressModal = utl.openRegistrationProgressModal(params.uri);
      service.registerOntology(brandNew, params, registrationCallback(params.uri, progressModal));
    };

    function registrationCallback(uri, progressModal) {
      return function cb(error, data) {
        progressModal.close();
        if (error) {
          progressModal.close();
          console.error(error);
          utl.error({
            errorPRE: error
          });
        }
        else {
          console.log("registerOntology: success data=", data);
          utl.message({
            title:   "Successful registration",
            message: '<div class="center">' +
            'Ontology URI:' +
            '<br>' +
            '<div class="uriText1">' +uri+ '</div>' +
            '</div>',
            ok: function() {
              $window.location.href = appUtil.getHref4uriWithSelfHostPrefix(uri);
            }
          });
        }
      }
    }
  }

})();
