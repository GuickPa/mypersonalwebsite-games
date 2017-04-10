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
                cc.game.onStart = function(){
                    //load resources
                    cc.LoaderScene.preload(["assets/games/tiles/scifi/level00.tmx", "assets/games/player/Idle (1).png"], function () {
                        var MyScene = cc.GameSceneScrollable.extend({
                            onEnter:function () {
                                this._super();
                                var size = cc.director.getWinSize();
                                var tileset = cc.TMXTiledMap.create("assets/games/tiles/scifi/level00.tmx");
                                tileset.setTag(0);
                                this.tilemap = tileset;
                                this.addChild(tileset, 0);
                                var tscale = size.height/(9*256);
                                tileset.setScale(tscale);
                                //GUI: wait a while, then load objects //GUI: avoid bug that makes objects looking for tiles before tilemap was completely loaded
                                cc.director.getScheduler().scheduleCallbackForTarget(this, this.onLoadTiledMap, 0.25, false, 0, false);
                            },

                            onLoadTiledMap: function(){
                                var size = cc.director.getWinSize();
                                var tscale = size.height/(9*256);
                                var sprite = cc.Player.create("assets/games/player/Idle (1).png");
                                sprite.setScale(0.25);
                                sprite.setPosition(2048 * size.height/(9*256), 1536 * size.height/(9*256));
                                this.addChild(sprite, 1);
                                //GUI: adding an enemy
                                // var enemy = cc.EnemyMale.create("assets/games/enemy/male/Idle (1).png");
                                // enemy.setScale(0.25);
                                // enemy.setPosition(512 * size.height/(9*256), 768 * size.height/(9*256));
                                // this.addChild(enemy, 1);
                                //
                                // enemy = cc.EnemyMale.create("assets/games/enemy/male/Idle (1).png");
                                // enemy.setScale(0.25);
                                // enemy.setPosition(7168 * size.height/(9*256), 768 * size.height/(9*256));
                                // this.addChild(enemy, 1);

                                this.leftBound = 2 * tscale * 256;
                                this.rightBound = size.width - (4 * tscale * 256);
                                this.setNodeToFollow(sprite);
                            }
                        });
                        cc.director.runScene(new MyScene());
                    }, this);
                };
                cc.game.run("gameCanvas");
            }

        }]);