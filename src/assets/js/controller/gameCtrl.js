/**
 * Created by guglielmo on 28/03/17.
 */
'use strict';

    guglielmodeletisCtrl.controller('gameCtrl', ['$rootScope','$scope','$controller', '$location', '$route', '$window','$timeout','$interval', 'angularLoad', 'cocos2dService',
        function gameCtrl($rootScope,$scope, $controller,$location, $route, $window,$timeout,$interval, angularLoad, cocos2dService) {

            $scope.loadCocos = function(){

            }

            $scope.$on('$viewContentLoaded', function(){
                cocos2dService.loadCocos(function(){
                        $scope.onCocosLoaded();
                    },
                    function(error){

                    })
            });

            $scope.onCocosLoaded = function(){                
                var cc = window.cocos.cc;
                var self = this;
                cc.game.onStart = function(){
                    //GUI: "static" instance of the game manager
                    cc.game.gameManager = cc.GameManager.create();
                    //GUI:add this as listener
                    //GUI: register for player events
                    cc.game.gameManager.addListenerForEvent(window.cocos.cc.GameManagerEvents.kGameManagerEventPlayerDead, self, self.onPlayerDead);
                    //GUI: make the scene
                    $scope.loadScene();
                };
                cc.game.run("gameCanvas");
            };

            $scope.loadScene = function(){
                var cc = window.cocos.cc;
                //load resources
                cc.LoaderScene.preload(["assets/games/tiles/scifi/Saw.png", "assets/games/tiles/scifi/level00.tmx"], function () {
                    var MyScene = cc.GameSceneScrollable.extend({
                        onEnter:function () {
                            this._super();
                            var size = cc.director.getWinSize();
                            var tileset = cc.TMXTiledMap.create("assets/games/tiles/scifi/level00.tmx");
                            tileset.setTag(0);
                            var tscale = size.height/(9*256);
                            tileset.setScale(tscale);
                            this.setTilemap(tileset);
                            this.addChild(tileset, 0);
                            //GUI: wait a while, then load objects
                            //GUI: avoid bug that makes objects looking for tiles before tilemap was completely loaded
                            cc.director.getScheduler().scheduleCallbackForTarget(this, this.onLoadTiledMap, 0.5, false, 0, false);
                        },

                        onLoadTiledMap: function(){
                            var size = cc.director.getWinSize();
                            var tscale = size.height/(9*256);
                            var sprite = this.createPlayer();
                            this.leftBound = 2 * tscale * 256;
                            this.rightBound = size.width - (4 * tscale * 256);
                            this.setNodeToFollow(sprite);

                            //GUI: add scene objects
                            this.createSceneEntities();
                        }
                    });
                    cc.director.runScene(new MyScene());
                }, this);
            };

            $scope.onPlayerDead = function(){
                var scene = window.cocos.cc.director.getRunningScene();
                var b = new window.cocos.ccui.Button();
                b.setTitleText("RESTART GAME");
                b.setNormalizedPosition(window.cocos.cc.p(0.5, 0.5));
                b.setTouchEnabled(true);
                b.setPressedActionEnabled(true);
                b.addTouchEventListener(function () {                    
                    $scope.loadScene();
                }, this);
                scene.addChild(b);
            }
        }]);