(function() {
  'use strict';

  var debug = appUtil.debug;

  angular.module('orrportal.upload', ['ngFileUpload'])
    .controller('UploadController', UploadController)
    .directive('orrportalUploadOntology', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/upload/upload.html'
      }
    })
    .directive('orrportalUploadFile', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/upload/upload-file.html'
      }
    })
    .directive('orrportalUploadUrl', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/upload/upload-url.html'
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
    .directive('selectStatus', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/upload/select-status.html'
      }
    })
    .directive('selectVisibility', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/upload/select-visibility.html'
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

  UploadController.$inject = ['$rootScope', '$scope', '$timeout', '$location', '$window', '$stateParams', 'Upload', 'cfg', 'service', 'utl'];

  function UploadController($rootScope, $scope, $timeout, $location, $window, $stateParams, Upload, cfg, service, utl) {
    if (debug) console.debug("++UploadController++");

    $scope.uriNewVersion = $stateParams.uriNewVersion;
    if (debug) console.debug("UploadController: uriNewVersion=", $scope.uriNewVersion);

    var userName, vm = $scope.vm = {
      originalUri: $scope.uriNewVersion,
      name:     '',

      prefixFullyHosted: appUtil.windowBareHref + '/',

      fileOrUrl: 'uploadFile',

      maxUploadSize: '10MB'  // TODO retrieve this limit from the backend

      ,visibilityOptions:  utl.visibilityOptions,
      selectedVisibility: undefined

      ,statusOptions:  utl.statusOptions,
      selectedStatus: undefined
    };

    // TODO use ui-router instead of the following hacky logic
    if (!$rootScope.rvm.accountInfo) {  // wait for a bit
      $timeout(function() {
        if (!$rootScope.rvm.accountInfo) {
          $location.url("/");
        }
        else enableController();
      }, 2000);
    }
    else enableController();

    function enableController() {
      $rootScope.rvm.curView = 'rx';

      userName = $rootScope.rvm.accountInfo.uid;

      $scope.vm = angular.extend(vm, {
        ownerOptions: [{
          id:    '~' + userName,
          name: 'User: ' + userName + ": " + $rootScope.rvm.accountInfo.displayName
        }],
        selectedOwner: undefined
      });

      // add user's organizations:
      service.refreshUser(userName, null, function(error, user) {
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

    if (!$scope.uriNewVersion) {
      $scope.$watch("vm.originalUri", function(val) {  // avoid pipe character
        if (val) {
          $scope.vm.originalUri = val.replace(/\|/g, "");
        }
      });
    }
    $scope.$watch("vm.name", function(val) {
      if (val) {
        $scope.vm.name = val.replace(/(<|>)/g, "");
      }
    });

    $scope.$watch("vm.fileOrUrl", function(val) {
      $scope.reinitVm()
    });

    $scope.doUpload = function() {
      vm.name = '';

      var data = {
        format:   '_guess'
      };

      if (vm.fileOrUrl === 'uploadFile') {
        data.file = vm.file;
        if ($rootScope.rvm.accountInfo && $rootScope.rvm.accountInfo.token) {
          data.jwt = $rootScope.rvm.accountInfo.token;
        }
        var url = appConfig.orront.rest + "/api/v0/ont/upload";
        if (debug) console.debug("Upload.upload: data=", data);
        Upload.upload({
          url: url,
          data: data
        }).then(
          function(resp) {
            if (debug) console.debug('Upload.upload:', resp.config.data.file.name, 'uploaded. resp:', resp);
            gotUploadResponse(resp.config.data.file.name, resp.data)
          },
          function (resp) {
            console.log('Error:', resp);
            if (resp.status === 406) {
              utl.error({
                size: 'sm',
                title: resp.data.error,
                error: "The given file does not correspond to a recognized ontology format."
              });
            }
            else {
              utl.error({
                title: "Status: " + resp.status,
                error: !resp.data ? "" : ("<pre>" + resp.data + "</pre>").replace("\n", "<br>")
              });
            }
          },
          function (evt) {
            vm.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          }
        );
      }
      else {
        if (!$scope.uriNewVersion) {
          vm.originalUri = undefined;
        }
        vm.uploadResponse = undefined;
        vm.uploadingRemoteUrl = true;
        data.remoteUrl = vm.remoteUrl;
        if (debug) console.debug("uploadRemoteUrl: data=", data);
        service.uploadRemoteUrl(data, function(err, resData) {
          vm.uploadingRemoteUrl = false;
          if (err) {
            if (debug) console.debug("uploadRemoteUrl: err=", err);
            if (err.status === 406) {
              utl.error({
                size: 'sm',
                title: err.data.error,
                error: "The given URL does not resolve to a recognized ontology format."
              });
            }
            else if (err.status === 502) {
              utl.error({
                title: "Error in remote server",
                error: "Remote server did not resolve this URL successfully."
                + "<br><br>"
                + "Reported HTTP status: " + err.data.status
                + "<br>"
                + "<pre>"
                + err.data.body.replace(/</g, "&lt;")
                + "</pre>"
              });

            }
            else {
              utl.error({
                error: err.error ? ("<pre>" + err.error + "</pre>").replace("\n", "<br>") : err
              });
            }
          }
          else {
            if (debug) console.debug("uploadRemoteUrl: resData=", resData);
            if (!$scope.uriNewVersion) {
              vm.originalUri = vm.remoteUrl;
            }
            gotUploadResponse(undefined, resData)
          }
        });
      }
    };

    function gotUploadResponse(origFilename, data) {
      vm.uploadResponse = {
        origFilename: origFilename,
        data:         data
      };
      if (debug) console.debug('possibleOntologyUris=', vm.uploadResponse.data.possibleOntologyUris);

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

    $scope.reinitVm = function() {
      vm.uploadResponse = undefined;
      vm.originalUri = $scope.uriNewVersion;
      vm.selectedOwner = vm.newShortName = undefined;
      vm.selectedVisibility = undefined;
      vm.selectedStatus = undefined;
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
        && vm.selectedVisibility
        && vm.selectedStatus
      ;
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
        visibility:       vm.selectedVisibility,
        status:           vm.selectedStatus
      };
      if (vm.knownOwner) {
        if (!vm.knownOwner.startsWith("~")) {
          params.orgName = vm.knownOwner;
        }
      }
      else if (!vm.selectedOwner.id.startsWith("~")) {
        params.orgName = vm.selectedOwner.id;
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
      vm.newShortName = '';
      vm.checkedNewUriIsAvailable = vm.newUriIsAvailable = false;
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
      vm.selectedStatus = undefined;
      vm.knownOwner = undefined;
      vm.userCanRegisterNewVersion = getUserCanRegisterNewVersion();

      // if the ontology exists, get some info from it
      service.refreshOntology(vm.newUri, null, gotOntology);

      function gotOntology(error, ontology) {
        vm.checkedNewUriIsAvailable = true;
        if (error) {
          if (debug) console.debug("error getting ontology:", error);
          vm.newUriIsAvailable = true;
        }
        else {
          if (debug) console.debug("got ontology:", ontology);
          vm.name = ontology.name;
          vm.newUriIsAvailable = false;

          vm.selectedVisibility = ontology.visibility;
          vm.selectedStatus     = ontology.status;

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
        if (debug) console.debug("owned by user:", vm.knownOwner);
        var userOntOwner = vm.knownOwner.substring(1);
        return $rootScope.rvm.accountInfo.uid === userOntOwner;
      }
      var orgOntOwner = vm.knownOwner;
      if (debug) console.debug("owned by org:", orgOntOwner, "accountInfo.organizations=", $rootScope.rvm.accountInfo.organizations);
      var organizations = $rootScope.rvm.accountInfo.organizations;
      return organizations && _.contains(_.map(organizations, "orgName"), orgOntOwner);
    }

    $scope.okToRegisterFullyHosted = function() {
      return vm.checkedNewUriIsAvailable
        && vm.name && vm.name.indexOf('<') < 0
        && vm.selectedVisibility
        && vm.selectedStatus
    };

    $scope.doRegisterFullyHosted = function() {
      var params = {
        uri:              vm.newUri,
        originalUri:      vm.originalUri,
        name:             vm.name,
        userName:         userName,
        uploadedFilename: vm.uploadResponse.data.filename,
        uploadedFormat:   vm.uploadResponse.data.format,
        visibility:       vm.selectedVisibility,
        status:           vm.selectedStatus
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
          if (debug) console.debug("registerOntology: success data=", data);
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
