(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.ont', ['orrportal.ont.contents', 'orrportal.multivalueedit'])
    .directive('orrOnt',  OntDirective)
    .directive('orrportalUriTitle', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/ont/uri-title.html'
      }
    })
    .directive('orrportalUriVersions', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/ont/uri-versions.html'
      }
    })
    .directive('orrportalUriOntTitle', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/ont/uri-onttitle.html'
      }
    })
    .directive('changeVisibility', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/ont/change-visibility.html'
      }
    })
    .directive('viewStatus', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/ont/view-status.html'
      }
    })
    .directive('changeStatus', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/ont/change-status.html'
      }
    })
    .directive('unregisterMenu', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/ont/unregister.html'
      }
    })
    .controller('RegisterOntController', RegisterOntController)
  ;

  OntDirective.$inject = [];
  function OntDirective() {
    if (debug) console.log("++OntDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/ont/ont.html',
      controller: OntController
    }
  }

  OntController.prototype.setMetaEditInProgress = function(inProgress) {
    var vm = this.scope.vm;
    vm.metaEditInProgress = inProgress;
    vm.someEditInProgress = vm.metaEditInProgress || vm.dataEditInProgress;
  };

  OntController.prototype.setDataEditInProgress = function(inProgress) {
    var vm = this.scope.vm;
    vm.dataEditInProgress = inProgress;
    vm.someEditInProgress = vm.metaEditInProgress || vm.dataEditInProgress;
  };

  OntController.prototype.someEditInProgress = function() {
    return this.scope.vm.someEditInProgress;
  };

  var changesWillBeLostPrompt = '\nAny changes made will be lost.\n\n';

  // todo reorganize! (too many deps)
  OntController.$inject = [
    '$rootScope', '$scope', '$stateParams', '$state', '$timeout', '$window', '$location', '$uibModal',
    'service', 'utl', 'vocabulary', 'cfg'
  ];
  function OntController(
    $rootScope, $scope, $stateParams, $state, $timeout, $window, $location, $uibModal,
    service, utl, vocabulary, cfg
  ) {

    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++OntController++ $scope=", $scope);

    this.scope = $scope;

    var rvm = $rootScope.rvm;

    // because of enclosing UriController we can already have ontology information here,
    // so we do a refreshOntology if not:
    var doRefreshOntology = false;
    //console.log("OntController vm=", _.cloneDeep($scope.vm));
    if (!$scope.vm) {
      $scope.vm = {
        uri:      rvm.rUri,
        version:  rvm.rVersion
      };
      doRefreshOntology = true;
    }
    var vm = $scope.vm;

    var leavePageHandling = (function() {
      var unsubscribeStateChangeStart = null;

      $scope.$on('$destroy', function() {
        //console.debug("**** $destroy");
        disable();
      });

      enable();

      return {
        enable:     enable,
        disable:    disable
      };

      function enable() {
        unsubscribeStateChangeStart = $scope.$on('$stateChangeStart', function(event) {
          //console.debug('$stateChangeStart: event=', event);
          if ($scope.editMode && !window.confirm(changesWillBeLostPrompt)) {
            event.preventDefault();
          }
        });

        //console.debug("**** addBeforeUnloadListener");
        window.addEventListener('beforeunload', leavePagePrompt);
      }

      function disable() {
        //console.debug("**** removeBeforeUnloadListener");
        window.removeEventListener('beforeunload', leavePagePrompt);
        if (unsubscribeStateChangeStart) unsubscribeStateChangeStart();
        unsubscribeStateChangeStart = null;
      }

      function leavePagePrompt(event) {
        //console.debug("**** leavePagePrompt $scope.editMode=", $scope.editMode);
        if ($scope.editMode) {
          event.returnValue = changesWillBeLostPrompt;
          return changesWillBeLostPrompt;
        }
      }
    })();

    $scope.linkForVersion = function(uri, ontVersion) {
      var params = [];
      // include version parameter only if it's not the latest:
      // (note: latest is the first in backend's returned list)
      var latestOntVersion = vm.ontology.versions[0];
      if (ontVersion.version !== latestOntVersion.version) {
        params.push('version=' + ontVersion.version);
      }

      // is our windowBareHref already the intended uri?
      if (bUtil.equalModuloTrailingSlash(appUtil.windowBareHref, uri)) {
        var link = uri;
      }
      else {
        link = appConfig.portal.mainPage;
        params.push('uri=' + uri);
      }
      if (params.length) {
        link += '?' + params.join('&');
      }
      return link;
    };

    var newFormat = $stateParams.newFormat;
    //console.debug("newFormat=", newFormat);

    if (vm.uri) {
      if (newFormat) console.warn("expecting undefined newFormat when vm.uri is defined. newFormat=", newFormat);

      vm.brandNew = false;
      if (doRefreshOntology) {
        refreshOntology();
      }
      else {
        ontologyRefreshed();
      }
    }
    else {
      if (!newFormat) console.warn("expecting defined newFormat when vm.uri is undefined");

      if (canCreateBrandNew()) {
        startBrandNew();
      }
      else {
        $timeout(function() {
          if (canCreateBrandNew()) {
            startBrandNew();
          }
          else {
            $location.url("/");
          }
        }, 1000);
      }
    }

    function canCreateBrandNew() {
      return $rootScope.rvm.accountInfo;
    }

    function startBrandNew() {
      vm.brandNew = true;
      vm.ontology = {
        "metadata": {
        },
        "versions": [
        ],
        "format": newFormat
      };
      vm.ontData = [];
      vm.ontDataFormat = newFormat;
      if (vm.ontDataFormat === 'v2r') {
        vm.ontData = [];
      }
      else {
        vm.ontData = {
          mappedOnts: [],
          mappings:   []
        };
      }

      var loggedInInfo = rvm.accountInfo;
      var userName = loggedInInfo.uid;

      vm.ownerOptions = [{
        id:    "~" + userName,
        name: 'User: ' + userName + ": " + loggedInInfo.displayName
      }];
      vm.selectedOwner = undefined;
      // add user's organizations:

      // TODO clean up!! as the organization might be already known here
      service.refreshUser(userName, null, function(error, user) {
        if (error) { console.error("error getting user:", error); }
        else {
          if (appUtil.debug) console.debug("refreshUser: got=", user);
          _.each(user.organizations, function(o) {
            vm.ownerOptions.push({
              id: o.orgName,
              name: 'Organization: ' + o.orgName + ": " + o.name
            });
          });

          var info = {
            base:          appUtil.windowBareHref,
            ownerOptions:  vm.ownerOptions
          };

          if (false) {
            // developer convenience: immediately go to the editing
            vm.ontology.uri = vm.uri = "http://example/TESTMAP";
            vm.ontology.ownerName = "~" + userName;
            initMetaForBrandNew("~" + userName);
            $scope.startEditMode();
          }
          else {
            editOntUri(info).result.then(function(res) {
              if (debug) console.debug('editOntUri dialog accepted: res=', res);
              vm.ontology.uri = vm.uri = res.uri;
              vm.ontology.ownerName = res.owner;
              vm.visibility = res.visibility;
              vm.status     = res.status;
              initMetaForBrandNew(res.owner);
              $scope.startEditMode();
            }, function() {
              $state.go("/");
            });
          }
        }
        function initMetaForBrandNew(owner) {
          var creator = loggedInInfo.displayName || userName || owner;
          var meta = vm.ontology.metadata;
          meta[vocabulary.omv.hasCreator.uri] = [creator];
        }
      });
    }

    function adjustMetaForBrandNew() {
      var meta = vm.ontology.metadata;
      if (!vm.ontology.ownerName.startsWith("~")) {
        meta[vocabulary.omvmmi.origMaintainerCode.uri] = [vm.ontology.ownerName];
      }
    }

    function refreshOntology() {
      service.refreshOntology(vm.uri, vm.version, gotOntology);

      function gotOntology(error, ontology) {
        if (error) {
          $scope.error = error;
          console.error("error getting ontology:", error);
        }
        else {
          vm.ontology = ontology;
          ontologyRefreshed();
        }
      }
    }

    function ontologyRefreshed() {
      $scope.viewAsOptions = setViewAsOptions(vm.uri);
      setVisibilityOptions();
      setStatusOptions();
      getOntologyData();

      function setViewAsOptions(uri) {
        uri = uri.replace(/#/g, '%23');
        function getUrl(format) {
          return appConfig.orront.rest + "/api/v0/ont?format=" +format+ "&uri=" + uri;
        }

        var list = [
          {
            label: "RDF/XML",
            url: getUrl('rdf')
          }, {
            label: "JSON-LD",
            url: getUrl('jsonld')
          }, {
            label: "N3",
            url: getUrl('n3')
          }, {
            label: "Turtle",
            url: getUrl('ttl')
          }, {
            label: "N-Triples",
            url: getUrl('nt')
          //}, {             // TODO jena fails with the following(?)
          //  label: "N-Quads",
          //  url: getUrl('nq')
          //}, {
          //  label: "TriG",
          //  getUrl('trig')
          }, {
            label: "RDF/JSON",
            url: getUrl('rj')
          }
        ];

        if(uri && cfg.externalTools && cfg.externalTools.ontViewers) {
          var ontUrl = appUtil.getOntUrlForExternalTool(uri);
          list.push({ divider: true });
          _.each(cfg.externalTools.ontViewers, function(x) {
            list.push({
              label: x.name,
              url: x.srcUrlTemplate.replace('$uri', ontUrl),
              includeExternalLinkIcon: true,
              tooltip: "External tool"
            });
          });
        }

        return list;
      }

      function setVisibilityOptions() {
        $scope.visibilityInfo = {
          owner:  'Visible only to the owner (submitting user or members of indicated organization) ' +
          'in the main ORR ontology page, or to anyone with the URI.',
          public: 'Visible to any visitor or client application.'
        };
        var all = _.keys($scope.visibilityInfo);
        $scope.visibilities = _.filter(all, function(v) { return v !== vm.ontology.visibility });
      }

      function setStatusOptions() {
        $scope.statusInfo = cfg.ontologyStatuses;
        var all = _.keys($scope.statusInfo);
        $scope.statuses = _.filter(all, function(s) { return s !== vm.ontology.status });
      }
    }

    $scope.canChangeVisibilityOrStatus = function() {
      if (!vm.ontology)                     return false;
      if (!vm.ontology.ownerName)           return false;
      if (!$rootScope.rvm.accountInfo)      return false;
      if ($rootScope.userLoggedInIsAdmin()) return true;

      if (vm.ontology.ownerName.startsWith("~")) {
        var userOntOwner = vm.ontology.ownerName.substring(1);
        return userOntOwner === rvm.accountInfo.uid;
      }
      else {
        if (!rvm.accountInfo.organizations) return false;
        var orgOntOwner = vm.ontology.ownerName;
        var userOrgs = _.map(rvm.accountInfo.organizations, "orgName");
        return _.contains(userOrgs, orgOntOwner);
      }
    };

    $scope.setVisibility = function(visibility) {
      utl.confirm({
        size: 'ls',
        title: 'Confirm visibility change',
        message: '<div class="center">' +
        'The visibility of ' +
        '<br>' +
        '<br>' +
        '<div class="uriText1">' +vm.uri+ '</div>' +
        'Version: ' + vm.ontology.version +
        '<br>' +
        '<br>' +
        'will be changed to <span class="bold">\'' + visibility + '\'</span>' +
        '<br>' +
        '<br>' +
        'Are you sure you want to proceed?' +
        '</div>',
        okLabel: 'Yes',
        ok: function() {
          console.debug("setting visibility=", visibility);
          var progressModal = utl.openRegistrationProgressModal(vm.uri, "Setting visibility...");

          var body = {
            uri:        vm.uri,
            version:    vm.ontology.version,
            visibility: visibility,
            userName:   $rootScope.rvm.accountInfo.uid
          };

          var brandNew = false;
          service.registerOntology(brandNew, body, function cb(error, data) {
            progressModal.close();
            if (error) {
              console.error(error);
              utl.error({
                errorPRE: error
              });
            }
            else {
              if (debug) console.debug("setVisibility: success data=", data);
              utl.message({
                title:   'Visibility has been changed to: <span class="bold">\'' + visibility + '\'</span>',
                message: '<div class="center">' +
                '<br>' +
                '<div class="uriText1">' +vm.uri+ '</div>' +
                '<br>' +
                'Version: ' + vm.ontology.version +
                '<br>' +
                '<br>' +
                '</div>',
                ok: function() {
                  $window.location.href = appUtil.getHref4uriWithSelfHostPrefix(vm.uri);
                }
              });
            }
          })
        }
      });
    };

    $scope.setStatus = function(status) {
      utl.confirm({
        size: 'ls',
        title: 'Confirm status change',
        message: '<div class="center">' +
        'The status of ' +
        '<br>' +
        '<br>' +
        '<div class="uriText1">' +vm.uri+ '</div>' +
        'Version: ' + vm.ontology.version +
        '<br>' +
        '<br>' +
        'will be changed to <span class="bold">\'' + status + '\'</span>' +
        '<br>' +
        '<br>' +
        'Are you sure you want to proceed?' +
        '</div>',
        okLabel: 'Yes',
        ok: function() {
          console.debug("setting status=", status);
          var progressModal = utl.openRegistrationProgressModal(vm.uri, "Setting status...");

          var body = {
            uri:        vm.uri,
            version:    vm.ontology.version,
            status:     status,
            userName:   $rootScope.rvm.accountInfo.uid
          };

          var brandNew = false;
          service.registerOntology(brandNew, body, function cb(error, data) {
            progressModal.close();
            if (error) {
              console.error(error);
              utl.error({
                errorPRE: error
              });
            }
            else {
              if (debug) console.debug("setStatus: success data=", data);
              utl.message({
                title:   'Status has been changed to: <span class="bold">\'' + status + '\'</span>',
                message: '<div class="center">' +
                '<br>' +
                '<div class="uriText1">' +vm.uri+ '</div>' +
                '<br>' +
                'Version: ' + vm.ontology.version +
                '<br>' +
                '<br>' +
                '</div>',
                ok: function() {
                  $window.location.href = appUtil.getHref4uriWithSelfHostPrefix(vm.uri);
                }
              });
            }
          })
        }
      });
    };

    $scope.unregisterer = (function() {
      return {
        canUnregister:      canUnregister,
        unregisterVersion:  function() { unregister(vm.ontology.version); },
        unregisterOntology: function() { unregister(); }
      };

      function canUnregister() {
        if (!vm.ontology)                     return false;
        if ($rootScope.userLoggedInIsAdmin()) return true;
      }

      function unregister(version) {
        var ontInfo = '<div class="uriText1">' +vm.uri+ '</div>' +
          (version ? 'Version: ' + vm.ontology.version : '(' +vm.ontology.versions.length+ ' versions)')+
            '<br><br>';

        utl.confirm({
          title: 'Confirm unregistration',
          size: 'ls',
          message:
            '<div class="center">' +
            ontInfo +
            'Are you sure you want to unregister this ontology ' +
            (version ? 'version' : 'including all its versions') + '?' +
          '</div>',
          okType: 'danger',
          okLabel: "Yes, I'm sure",
          ok: function() { doUnregister(version); }
        });

        function doUnregister(version) {
          var progressModal = utl.openRegistrationProgressModal(vm.uri,
            "Unregistering " +(version ? version : 'ontology') + "...");

          var params = {
            uri:        vm.uri,
            userName:   $rootScope.rvm.accountInfo.uid
          };
          if (version) {
            params.version = version;
          }

          service.unregisterOntology(params, function cb(error, data) {
            progressModal.close();
            if (error) {
              console.error(error);
              utl.error({ errorPRE: error });
            }
            else {
              if (debug) console.debug("unregisterOntology: success data=", data);
              utl.message({
                title:   'Unregistration complete',
                message:
                  '<div class="center">' +
                  ontInfo +
                  '</div>',
                ok: function() {
                  $window.location.href = cfg.portal.mainPage;
                }
              });
            }
          });
        }
      }
    })();

    $scope.canEditNewVersion = function() {
      if (!vm.ontology)                     return false;
      if ($rootScope.userLoggedInIsAdmin()) return true;
      if (!$rootScope.rvm.accountInfo)      return false;

      if (!vm.ontology.ownerName)           return true; // TODO review this

      if (vm.ontology.ownerName.startsWith("~")) {
        var userOntOwner = vm.ontology.ownerName.substring(1);
        return userOntOwner === rvm.accountInfo.uid;
      }
      else {
        if (!rvm.accountInfo.organizations) return false;
        var orgOntOwner = vm.ontology.ownerName;
        var userOrgs = _.map(rvm.accountInfo.organizations, "orgName");
        return _.contains(userOrgs, orgOntOwner);
      }
    };

    $scope.startEditMode = function() {
      if (vm.ontDataFormat === 'v2r' || vm.ontDataFormat === 'm2r') {
        // v2r and m2r always edited in the UI (both metadata and data)
        $scope.editMode = true;
      }
      else {
        var options = ["Edit metadata", "Upload file"];
        utl.selectButton({
          title:   "Select option to create new version",
          message: '<p>' +
          'You can either edit the metadata' +
          ' or upload a file for the new version.' +
          '</p>',
          options: options,
          selected: function(index) {
            if (index === 0) {
              $scope.editMode = true;
            }
            else {
              var href = appUtil.windowBareHref + "#rx/" + vm.uri;
              $window.open(href, "_self");
            }
          }
        });
      }
    };

    $scope.cancelNewVersion = function() {
      leavePageHandling.disable();
      if (window.confirm(changesWillBeLostPrompt)) {
        if (vm.brandNew) {
          $state.go("/");
        }
        else {
          leavePageHandling.enable();
          $scope.editMode = false;
          refreshOntology();
        }
      }
      else {
        leavePageHandling.enable();
      }
    };

    $scope.registerOntology = function () {
      if (vm.brandNew) {
        doRegisterOntology();  // do not capture logMessage in this case
      }
      else {
        var modalInstance = $uibModal.open({
          templateUrl: 'js/ont/ont-register.html',
          controller:  'RegisterOntController',
          backdrop:    'static'
        });
        modalInstance.result.then(doRegisterOntology);
      }
    };

    function doRegisterOntology(logMessage) {
      if (debug) console.debug("doRegisterOntology: logMessage=", logMessage);
      var body = {
        uri:        vm.uri,
        userName:   $rootScope.rvm.accountInfo.uid
        ,visibility: vm.visibility
        ,status:     vm.status
      };

      if (logMessage) {
        body.log = logMessage;
      }

      if (vm.ontDataFormat === 'v2r' || vm.ontDataFormat === 'm2r') {
        // Whole contents submission case.
        body.format = vm.ontDataFormat;

        if (!vm.ontology.ownerName.startsWith("~")) {
          body.orgName = vm.ontology.ownerName;
        }

        body.name = getNameFromOmv(vm.ontology.metadata);
        if (vm.brandNew) adjustMetaForBrandNew();

        var object = {
          metadata: vm.ontology.metadata
        };
        if (vm.ontDataFormat === 'v2r') {
          object.vocabs = vm.ontData;
        }
        else {
          object.mappedOnts = vm.ontData.mappedOnts;
          object.mappings   = vm.ontData.mappings;
        }

        body.contents = angular.toJson(omitSpecialFields(object));
        if (debug) console.debug("TO submit " +vm.ontDataFormat+ " = ", body.contents);
      }
      else {
        // Only metadata submission case.
        var newMetadata = {};
        _.each(vm.ontology.metadata, function (values, predicate) {
          values = _.filter(values, function (v) { return v; }); // only defined values
          if (values.length) {
            newMetadata[predicate] = values.length === 1 ? values[0] : values;
          }
        });

        $scope.debug_newMetadata = newMetadata;

        body.name = getNameFromOmv(newMetadata);

        body.metadata = angular.toJson(newMetadata);
      }

      var progressModal = utl.openRegistrationProgressModal(vm.uri);

      service.registerOntology(vm.brandNew, body, registrationCallback(body.uri));

      // registrationCallback: verbatim copy from upload.js  TODO move to a common place
      function registrationCallback(uri) {
        return function cb(error, data) {
          progressModal.close();
          if (error) {
            console.error(error);
            utl.error({
              errorPRE: error
            });
          }
          else {
            $scope.editMode = false;

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

      function omitSpecialFields(obj) {
        return bUtil.filterKeys(obj, function(key) {
          return !key.startsWith('_');
        });
      }

      // omv:name used for 'name' in the ontology entry in the backend
      function getNameFromOmv(meta) {
        var omv_name = meta[vocabulary.omv.name.uri];
        if (debug) console.debug("omv_name=", omv_name, typeof omv_name);
        if (omv_name) {
          return angular.isArray(omv_name) ? omv_name.join("; ") : omv_name;
        }
      }
    }

    function getOntologyData() {
      if (vm.ontology.format === 'v2r') {
        getOntologyDataV2r();
      }
      else if (vm.ontology.format === 'm2r') {
        getOntologyDataM2r();
      }
      else {
        getOntologyDataOtherFormat();
      }
    }

    function getOntologyDataV2r() {
      service.getOntologyFormat(vm.uri, vm.version, "v2r", gotOntologyV2r);

      function gotOntologyV2r(error, data) {
        if (error) {
          $scope.error = error;
          console.error(error);
        }
        else {
          //console.log("gotOntologyV2r: data=", data);
          vm.ontData = data.vocabs;
          vm.ontDataFormat = 'v2r';
        }
      }
    }

    function getOntologyDataM2r() {
      service.getOntologyFormat(vm.uri, vm.version, "m2r", gotOntologyM2r);

      function gotOntologyM2r(error, data) {
        if (error) {
          $scope.error = error;
          console.error(error);
        }
        else {
          console.log("gotOntologyM2r: data=", data);
          vm.ontData = {
            mappedOnts: data.mappedOnts,
            mappings:   data.mappings
          };
          vm.ontDataFormat = 'm2r';
        }
      }
    }

    function getOntologyDataOtherFormat() {
      service.getOntologyFormat(vm.uri, vm.version, 'rj', gotOntologyOtherFormat);

      function gotOntologyOtherFormat(error, data) {
        if (error) {
          $scope.error = error;
          console.error(error);
          return;
        }

        //console.log("gotOntologyOtherFormat: data=", data);

        var v2rVocabs = try_voc_2_v2r(vm.uri, data);
        if (v2rVocabs) {
          vm.ontData = v2rVocabs;
          vm.ontDataFormat = 'v2r';
          return;
        }

        var m2rOntData = try_map_2_m2r(vm.uri, data, vocabulary);
        if (m2rOntData) {
          vm.ontData = m2rOntData;
          vm.ontDataFormat = 'm2r';
          return;
        }

        // Else: just dispatch generic rj
        vm.ontData = data;
        vm.ontDataFormat = 'rj';
      }
    }

    function editOntUri(info) {
      if (appUtil.debug) console.debug("editOntUri': info=", info);
      return $uibModal.open({
        templateUrl: 'js/ont/ont-uri-editor.html',
        controller:   OntUriEditorController,
        backdrop:    'static',
        resolve: {
          info: function () {
            return info;
          }
        }
      });
    }
  }

  OntUriEditorController.$inject = ['$rootScope', '$scope', '$uibModalInstance', 'info', 'service', 'utl'];
  function OntUriEditorController($rootScope, $scope, $uibModalInstance, info, service, utl) {
    if (debug) console.debug("++OntUriEditorController++: info=", info);

    var vm = $scope.vm = {
      title:      'Ontology owner, URI, visibility, and status',
      base:       info.base,
      ownerOptions: info.ownerOptions,
      uriType:    'orrBasedUri',
      owner:      undefined,
      shortName:  undefined

      ,visibilityOptions:  utl.visibilityOptions,
      selectedVisibility: undefined

      ,statusOptions:  utl.statusOptions,
      selectedStatus: undefined
    };

    $rootScope.$on('$stateChangeStart', function(event) {
      //console.debug("$stateChangeStart: arguments=", arguments);
      event.preventDefault();
    });

    $scope.$watch("vm.shortName", function(val) {
      if (val) {
        val = val.replace(/\s+/g, "_");
        vm.shortName = val.replace(/[\s/|?&!,;'\\]/gi, "");
      }
    });

    $scope.uriEditFormOk = function() {
      if (!vm.owner) return false;
      if (!vm.selectedVisibility) return false;
      if (!vm.selectedStatus) return false;

      if (vm.uriType === 'orrBasedUri')
        return vm.shortName;
      else
        return vm.uri;
    };

    $scope.doneUriEdit = function() {
      if (vm.uriType === 'orrBasedUri') {
        vm.uri = vm.base + "/" + vm.owner.id + "/" + vm.shortName;
      }

      // check that the uri is available:
      service.existsOntology(vm.uri, gotExistsOntology);
      function gotExistsOntology(error, response) {
        if (error) {
          if (debug) console.debug("error making existsOntology request:", error);
          $uibModalInstance.close({
            uri:         vm.uri,
            owner:       vm.owner.id
            ,visibility: vm.selectedVisibility
            ,status:     vm.selectedStatus
          });
        }
        else {
          if (debug) console.debug("existsOntology response:", response);
          utl.message({
            title:   'URI already registered',
            message: '<div class="center">' +
            '<div class="uriText1">' +vm.uri+ '</div>' +
            '<br>' +
            'This URI is already registered. Please use a different URI.' +
            '<br>' +
            '</div>'
          });
        }
      }
    };

    $scope.cancelUriEdit = function() {
      $uibModalInstance.dismiss();
    };
  }

  /**
   * Obtains the 'v2r.vocabs' format of the given data if the metadata indicates
   * the use of the voc2rdf tool.
   * This is a helper to facilitate the creation of a new version
   * of existing "voc2rdf" entries with the new 'v2r' format.
   */
  function try_voc_2_v2r(uri, data) {
    var usedOntologyEngineeringToolPropertyUri = 'http://omv.ontoware.org/2005/05/ontology#usedOntologyEngineeringTool';
    var voc2rdfPropertyUri = 'http://mmisw.org/ont/mmi/20081020/ontologyMetadata/voc2rdf';
    var rdfsLabelUri = 'http://www.w3.org/2000/01/rdf-schema#label';
    var owlClassUri = 'http://www.w3.org/2002/07/owl#Class';

    var ontProps = data[uri];
    if (!ontProps) {
      return;
    }

    var usedOntologyEngineeringToolValue = ontProps[usedOntologyEngineeringToolPropertyUri];
    if (!usedOntologyEngineeringToolValue) {
      if (debug) console.debug("try_voc_2_v2r: property no included: ", usedOntologyEngineeringToolPropertyUri);
      return;
    }

    var isVoc2Rdf = _.any(usedOntologyEngineeringToolValue, {value: voc2rdfPropertyUri});

    if (!isVoc2Rdf) {
      if (debug) console.debug("try_voc_2_v2r: Ontology not built with voc2rdf");
      return;
    }

    if (debug) console.log("try_voc_2_v2r: Yes! voc2rdf");

    // get classes:

    var classUris = [];
    _.forOwn(data, function(props, uri) {
      var t = props['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'];
      if (t && t.length && t[0].type === "uri" && t[0].value === owlClassUri) {
        classUris.push(uri);
      }
    });

    if (!classUris.length) {
      console.error("try_voc_2_v2r: unexpected: no owl:Class found");
      return;
    }
    if (debug) console.debug("try_voc_2_v2r: classUris=", classUris);

    var vocabs = _.map(classUris, function(classUri) {
      var classProps = data[classUri];
      var classLabelPropsArray = classProps[rdfsLabelUri];
      if (classLabelPropsArray && classLabelPropsArray.length) {
        var classLabel = classLabelPropsArray[0].value;
      }

      var properties = getProperties(classUri, data);
      var instances = getInstances(classUri, properties, data);

      var clazz = {
        label: classLabel
      };
      setUriAndName(clazz, classUri);
      return {
        'class': clazz,
        properties: properties,
        terms: instances
      };

      function getProperties(classUri, data) {
        var properties = [];
        _.each(data, function(props, propUri) {
          //console.log("propUri=", propUri, "props=", props);
          var domain = props['http://www.w3.org/2000/01/rdf-schema#domain'];
          if (domain && domain.length && domain[0].value === classUri) {
            var label = props['http://www.w3.org/2000/01/rdf-schema#label'];
            var prop = {
              label: label.length && label[0].value || propUri
            };
            setUriAndName(prop, propUri);
            properties.push(prop);
          }
        });
        return properties;
      }

      function getInstances(classUri, properties, data) {
        var terms = [];
        _.each(data, function(props, termUri) {
          //console.log("termUri=", termUri, "props=", props);
          var type = props['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'];
          if (type && type.length && type[0].value === classUri) {
            var term = {
              attributes: []
            };
            setUriAndName(term, termUri);
            _.each(properties, function(property) {
              if (props[property.uri]) {
                var values = props[property.uri];
                term.attributes.push(_.map(values, "value"));
              }
              else term.attributes.push([]);
            });
            terms.push(term);
          }

        });
        return terms;
      }

      function setUriAndName(obj, entityUri) {
        obj.uri = entityUri;
        if (entityUri.startsWith(uri + "/")) {
          obj.name = entityUri.substring((uri + "/").length);
        }
      }
    });
    console.debug("try_voc_2_v2r: vocabs=", vocabs);
    return vocabs;
  }

  /**
   * Obtains the 'm2r' format (mappedOnts and mappings) of the given data if the metadata indicates
   * the use of the vine tool.
   * This is a helper to facilitate the creation of a new version
   * of existing "vine" entries with the new 'm2r' format.
   */
  function try_map_2_m2r(uri, data, vocabulary) {
    var owl = vocabulary.owl;
    var usedOntologyEngineeringToolPropertyUri = 'http://omv.ontoware.org/2005/05/ontology#usedOntologyEngineeringTool';
    var vinePropertyUri = 'http://mmisw.org/ont/mmi/20081020/ontologyMetadata/vine';
    var vineStatementUri = 'http://mmisw.org/ont/mmi/vine/Statement';
    var vineSubjectUri = 'http://mmisw.org/ont/mmi/vine/subject';
    var vinePredicateUri = 'http://mmisw.org/ont/mmi/vine/predicate';
    var vineObjectUri = 'http://mmisw.org/ont/mmi/vine/object';

    var ontProps = data[uri];
    if (!ontProps) {
      return;
    }

    var usedOntologyEngineeringToolValue = ontProps[usedOntologyEngineeringToolPropertyUri];
    if (!usedOntologyEngineeringToolValue) {
      if (debug) console.debug("try_map_2_m2r: property no included: ", usedOntologyEngineeringToolPropertyUri);
      return;
    }

    var isVine = _.any(usedOntologyEngineeringToolValue, {value: vinePropertyUri});

    if (!isVine) {
      if (debug) console.debug("try_map_2_m2r: Ontology not built with vine");
      return;
    }

    if (debug) console.log("try_map_2_m2r: Yes! vine");

    var mappedOnts = [];
    var uriProps = data[uri];
    if (uriProps) {
      mappedOnts = _.map(uriProps[owl.imports.uri], "value");
    }

    // get vine statements:
    var mappings = [];
    _.forOwn(data, function(props, uri) {
      var types = props['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'];
      if (types && _.any(types, {value: vineStatementUri})) {
        var subjectUris   = _.map(props[vineSubjectUri], "value");
        var predicateUris = _.map(props[vinePredicateUri], "value");
        var objectUris    = _.map(props[vineObjectUri], "value");
        _.each(predicateUris, function(predicateUri) {
          mappings.push({
            subjects:  subjectUris,
            predicate: predicateUri,
            objects:   objectUris
          });
        });
      }
    });

    if (debug) console.debug("try_map_2_m2r: mappings=", mappings);

    return {
      mappedOnts: mappedOnts,
      mappings: mappings
    };
  }

  RegisterOntController.$inject = ['$scope', '$uibModalInstance', 'focus'];
  function RegisterOntController($scope, $uibModalInstance, focus) {
    if (debug) console.debug("++RegisterOntController++");

    var vm = $scope.vm = {
      logMessage:   ''
    };
    focus("register_form_activation", 700, {select: true});

    $scope.doOntRegistration = function() {
      $uibModalInstance.close(vm.logMessage);
    };

    $scope.cancelOntRegistration = function() {
      $uibModalInstance.dismiss();
    };
  }

})();
