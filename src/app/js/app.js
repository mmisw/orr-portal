(function() {
  'use strict';

  angular.module('orrportal', [
    'ngRoute',
    'ngSanitize',
    'ui.bootstrap'
    ,'angular-clipboard'
    ,'orrportal.main'
    ,'orrportal.facet'
    ,'orrportal.ontgrid'
    ,'orrportal.org'
    ,'orrportal.uri'
    ,'orrportal.user'
    ,'orrportal.st'
    ,'orrportal.kw'
    ,'orrportal.voc'
    ,'orrportal.firebase'
    ,'orrportal.upload'
  ])
    .constant("rUri", appUtil.uri)
    .constant("cfg", appConfig)
    .run(init)
    .config(routes)
  ;

  init.$inject = ['$rootScope', '$location', 'rUri', 'cfg'];

  function init(scope, $location, rUri, cfg) {
    if (appUtil.debug) console.log("++INIT++");

    scope.debug = appUtil.debug;

    scope.rUri = rUri;

    if (appUtil.debug) {
      appUtil.debug.collapsed = true;
      appUtil.debug.model = {};
    }

    scope.cfg = cfg;

    scope.masterAuth = {};

    // TODO unify elements under vm
    scope.vm = {};

    scope.refresh = function() {
      scope.$broadcast('evtRefresh');
    };

    scope.$on('evtRefreshing', function(event, b) {
      scope.refreshing = b;
    });

    scope.uploadOntology = function() {
      $location.url("rx")
    };

    scope.userLoggedIn = function() {
      return scope.masterAuth && scope.masterAuth.loggedInInfo
        && scope.masterAuth.loggedInInfo.uid;
    };
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
        templateUrl: 'js/upload/views/upload.tpl.html',
        controller: 'UploadController'
      })

      .otherwise({redirectTo: '/'});
  }

})();
