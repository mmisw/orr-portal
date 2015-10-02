(function() {
'use strict';

angular.module('orrportal', [
    'ngRoute',
    'ngSanitize',
    'ui.bootstrap',
    'orrportal.main',
    'orrportal.facet',
    'orrportal.login',
    'orrportal.ontgrid',
    'orrportal.org',
    'orrportal.uri',
    'orrportal.user'
])
    .constant("cfg", appConfig)
    .run(init)
    .config(routes)
;

init.$inject = ['$rootScope', '$location', 'cfg', 'service', 'ipCookie', 'authService'];

function init(scope, $location, cfg, service, ipCookie, authService) {
    if (appUtil.debug) console.log("++INIT++");

    scope.debug = appUtil.debug;

    if (appUtil.debug) {
        appUtil.debug.collapsed = true;
        appUtil.debug.model = {};
    }

    scope.cfg = cfg;

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

routes.$inject = ['$routeProvider'];

function routes($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'js/main/views/main.tpl.html',
            controller: 'MainController'})

        .when('/so/:so*', {
            templateUrl: 'js/main/views/main.tpl.html',
            controller: 'MainController'})

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

})();
