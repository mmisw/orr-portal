(function() {
  'use strict';

  angular.module('orrportal', [
    'ngRoute',
    'ngSanitize',
    'ui.bootstrap'
    ,'angular-clipboard'
    ,'orrportal.main'
    ,'orrportal.facet'
    ,'orrportal.login'
    ,'orrportal.ontgrid'
    ,'orrportal.org'
    ,'orrportal.uri'
    ,'orrportal.user'
    ,'orrportal.st'
    ,'orrportal.kw'
    ,'orrportal.voc'
  ])
    .constant("rUri", appUtil.uri)
    .constant("cfg", appConfig)
    .run(init)
    .factory('httpInterceptor', httpInterceptor)
    .config(http)
    .config(routes)
  ;

  init.$inject = ['$rootScope', '$location', 'rUri', 'cfg', 'service', 'ipCookie', 'authService'];

  function init(scope, $location, rUri, cfg, service, ipCookie, authService) {
    if (appUtil.debug) console.log("++INIT++");

    scope.debug = appUtil.debug;

    scope.rUri = rUri;

    if (appUtil.debug) {
      appUtil.debug.collapsed = true;
      appUtil.debug.model = {};
    }

    scope.cfg = cfg;

    // TODO unify elements under vm
    scope.vm = {};

    scope.loginInfo = (ipCookie("ontorr") || {}).loginInfo || {};
    //console.log("scope.loginInfo=", scope.loginInfo);
    authService.initAuthentication();
    scope.signIn = function() {
      var redirect = $location.url();
      if (!redirect.startsWith("/signIn")) {
        $location.url("/signIn" + redirect);
      }
    };
    scope.signOut = function() {
      authService.signOut();
      service.setDoRefreshOntologies(true);
      scope.refresh();
    };
    //scope.isPrivilegedSession = authService.isAdmin;

    scope.refresh = function() {
      scope.$broadcast('evtRefresh');
    };

    scope.$on('evtRefreshing', function(event, b) {
      scope.refreshing = b;
    });
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

      .otherwise({redirectTo: '/'});
  }

  httpInterceptor.$inject = ['$rootScope'];

  function httpInterceptor($rootScope) {
    return {
      responseError: function(rejection) {
        if (rejection.status === 401) {
          //console.log(appUtil.logTs() + ": unauthorized");
          $rootScope.signOut();
        }
        return rejection;
      }
    };
  }

  http.$inject = ['$httpProvider'];

  function http($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
  }

})();
