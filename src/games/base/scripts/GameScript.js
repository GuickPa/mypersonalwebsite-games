/**
 * Created by guglielmo on 13/04/17.
 */
//GUI: base class for scripts
// a script is an action like changeScene, changeState of a state machine, etc

//GUI: defining templates of gamescripts
window.cocos.cc.GameScriptType = {
    PAUSEGAME: "pause",
    RESUMEGAME: "resume",
    CHANGESCENE: "changescene"
}

window.cocos.cc.GameScript = window.cocos.cc.Class.extend({
    _className: "GameScript",
    //GUI: custom
    type: null,
    params: null,

    ctor: function(type, params){
        this.init(type, params);
    },

    init: function(type, params){
        this.type = type;
        this.params = params;
    },

    play: function(){
        console.log("Playing script", this.type, this.params);
        var types = window.cocos.cc.GameScriptType;
        switch(this.type){
            case types.PAUSEGAME:{
                this.pauseGame(this.params);
            }
                break;
            case types.RESUMEGAME:{
                this.resumeGame(this.params);
            }
                break;
            case types.CHANGESCENE:{
                this.changeScene(this.params);
            }
                break;
        }
    },

    pauseGame: function(params){
        var director = window.cocos.cc.director;
        var scene = director.getRunningScene();
        if(scene){
            director.getActionManager().pauseTarget(scene);
        }
    },

    resumeGame: function(params){
        var director = window.cocos.cc.director;
        var scene = director.getRunningScene();
        if(scene){
            director.getActionManager().resumeTarget(scene);
        }
    },

    changeScene: function(params){
        if(params && params.length > 0) {
            var cc = window.cocos.cc;
            var tileMapName = params[0];
            //load resources
            cc.LoaderScene.preload([tileMapName], function () {
                var MyScene = cc.GameSceneScrollable.extend({
                    onEnter:function () {
                        this._super();
                        var size = cc.director.getWinSize();
                        var tileset = cc.TMXTiledMap.create(tileMapName);
                        tileset.setTag(0);
                        var tscale = size.height/(9*256);
                        this.setScale(tscale);
                        this.setTilemap(tileset);
                        this.addChild(tileset, 0);
                        //GUI: wait a while, then load objects
                        //GUI: avoid bug that makes objects looking for tiles before tilemap was completely loaded
                        cc.director.getScheduler().scheduleCallbackForTarget(this, this.onLoadTiledMap, 0.5, false, 0, false);
                    },

                    onLoadTiledMap: function(){
                        var size = cc.size(this.tilemap.getTileSize().width * 16, this.tilemap.getTileSize().height * 9);
                        var tscale = 1;//size.height/(9*256);
                        var sprite = this.createPlayer();
                        this.leftBound = 2 * tscale * 256;
                        this.rightBound = size.width - (4 * tscale * 256);
                        this.setNodeToFollow(sprite, sprite.speed);
                        //GUI: add scene objects
                        console.log(size, this.leftBound, this.rightBound);
                        this.createSceneEntities();
                    }
                });
                cc.director.runScene(new MyScene());
            }, this);
        }
    }
});

window.cocos.cc.GameScript.create = function(type, params){
    return new window.cocos.cc.GameScript(type, params);
};