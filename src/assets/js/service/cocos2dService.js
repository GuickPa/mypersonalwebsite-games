/**
 * Created by guglielmo on 29/03/17.
 */
'use strict';

var guglielmodeletisService = angular.module('guglielmodeletisService', [])


    .service('cocos2dService', ['$rootScope', '$location', '$route', '$window','$timeout','$interval', 'angularLoad',
        function cocos2dService($rootScope, $location, $route, $window,$timeout,$interval, angularLoad) {
            this.loadCocos = function(success, failure){
                angularLoad.loadScript('games/cocos2d.js').then(function() {
                    //GUI: cocos loaded succesfully. Let's init it
                    window.cocos.initCocos();
                    //GUI: now loading my extensions
                    angularLoad.loadScript('games/base/engineBase.js').then(function() {
                        // Script loaded succesfully.
                        // We can now start using the functions from someplugin.js
                        if(success){
                            success();
                        }
                    }).catch(function(error) {
                        // There was some error loading the script. Meh
                        console.log("Loading cocos.js error", error);
                        if(failure){
                            failure(error);
                        }
                    });
                }).catch(function(error) {
                    // There was some error loading the script. Meh
                    console.log("Loading cocos.js error", error);
                    if(failure){
                        failure(error);
                    }
                });
            }

        }]);