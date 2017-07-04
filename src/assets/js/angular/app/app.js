/**
 * Created by guglielmo on 28/03/17.
 */
'use strict';

    var dependencies = [
        'ngRoute',
        'ngSanitize',
        'guglielmodeletisController',
        'guglielmodeletisService',
        'angularLoad'
    ];
    // Declare app level module which depends on filters, and services
    angular.module('guglielmodeletis', dependencies)
        .config(['$routeProvider', function ($routeProvider) {

        $routeProvider

            .when('/', {
                templateUrl: 'assets/templates/index.html',
                controller: 'indexCtrl'
            })

            .when('/games', {
                templateUrl: 'assets/templates/game.html',
                controller: 'gameCtrl'
            })

            .otherwise({
                redirectTo: '/'
            });
    }])
    .run([
        '$rootScope',
        '$http',
        '$timeout',
        '$location',
        '$window',
        function($rootScope, $http, $timeout, $location, $window){
            
        }]);

            