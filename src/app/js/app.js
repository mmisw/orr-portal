(function() {
  'use strict';

  angular.module('orrportal', [
    'ngRoute',
    'ngSanitize',
    'ui.bootstrap'
    ,'ui.select'
    ,'xeditable'
    ,'angular-clipboard'
    ,'orrportal.main'
    ,'orrportal.facet'
    ,'orrportal.ontgrid'
    ,'orrportal.org'
    ,'orrportal.uri'
    ,'orrportal.user'
    ,'orrportal.st'
    ,'orrportal.kw'
    ,'orrportal.v2r'
    ,'orrportal.voc'
    ,'orrportal.firebase'
    ,'orrportal.upload'
    ,'orrportal.util'
  ])
    .constant("rUri", appUtil.uri)
    .constant("cfg", appConfig)
    .run(init)
    .run(xeditable)
    .config(routes)
  ;

  init.$inject = ['$rootScope', '$location', 'rUri', 'cfg'];

  function init($rootScope, $location, rUri, cfg) {
    if (appUtil.debug) console.log("++INIT++");

    $rootScope.debug = appUtil.debug;
    $rootScope.cfg = cfg;

    var rvm = $rootScope.rvm = {
      masterAuth: {},
      rUri:       rUri
    };

    if (appUtil.debug) {
      appUtil.debug.collapsed = true;
      appUtil.debug.model = {};
    }


    $rootScope.refresh = function() {
      $rootScope.$broadcast('evtRefresh');
    };

    $rootScope.$on('evtRefreshing', function(event, b) {
      $rootScope.refreshing = b;
    });


    // TODO use popup dialog for uploadOntology??
    $rootScope.uploadOntology = function() {
      $location.url("rx");
    };

    // TODO use popup dialog for createOrg??
    $rootScope.createOrg = function() {
      $location.url("neworg");
    };

    $rootScope.userLoggedIn = function() {
      if (rvm.masterAuth && rvm.masterAuth.loggedInInfo && rvm.masterAuth.loggedInInfo.uid) {
        return rvm.masterAuth.loggedInInfo;
      }
    };

    $rootScope.userLoggedInIsAdmin = function() {
      return $rootScope.userLoggedIn() && rvm.masterAuth.role === "admin";
    }
  }

  xeditable.$inject = ['editableOptions'];

  function xeditable(editableOptions) {
    editableOptions.theme = 'bs3';
  }

  routes.$inject = ['$routeProvider', 'rUri'];

  function routes($routeProvider, rUri) {
    console.log("routes: rUri=", rUri);
    $routeProvider
      // root "/" route set depending on whether we have a URI to dispatch:
      .when('/', rUri
        ? {
          templateUrl: 'js/uri/views/uri.tpl.html',
          controller: 'UriController'}
        : {
          templateUrl: 'js/main/views/main.tpl.html',
          controller: 'MainController'}
      )

      .when('/so/:so*', {
        templateUrl: 'js/main/views/main.tpl.html',
        controller: 'MainController'})

      .when('/st/', {
        templateUrl: 'js/st/views/st.tpl.html',
        controller: 'SearchTermsController'})
      .when('/st/:st*', {
        templateUrl: 'js/st/views/st.tpl.html',
        controller: 'SearchTermsController'})

      .when('/kw/', {
        templateUrl: 'js/kw/views/kw.tpl.html',
        controller: 'KeywordSearchController'})
      .when('/kw/:kw*', {
        templateUrl: 'js/kw/views/kw.tpl.html',
        controller: 'KeywordSearchController'})

      .when('/uri/:uri*', {
        templateUrl: 'js/uri/views/uri.tpl.html',
        controller: 'UriController'
      })

      .when('/org/:orgName*', {
        templateUrl: 'js/org/views/org.tpl.html',
        controller: 'OrgController'
      })

      .when('/neworg', {
        templateUrl: 'js/org/views/createOrg.tpl.html',
        controller: 'CreateOrgController'
      })
      .when('/user/:userName*', {
        templateUrl: 'js/user/views/user.tpl.html',
        controller: 'UserController'
      })

      .when('/signIn', {
        templateUrl: 'js/auth/views/login.tpl.html',
        controller: 'LoginController'
      })
      .when('/signIn/:redirect*', {
        templateUrl: 'js/auth/views/login.tpl.html',
        controller: 'LoginController'
      })

      .when('/fireauth-test', {  // TODO remove
        templateUrl: 'js/fireauth/views/test.tpl.html'
      })

      .when('/rx', {
        templateUrl: 'js/upload/views/sequence.tpl.html',
        controller: 'UploadController'
      })

      .otherwise({redirectTo: '/'});
  }

})();
