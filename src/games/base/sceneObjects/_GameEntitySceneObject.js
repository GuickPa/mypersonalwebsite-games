/**
 * Created by guglielmo on 13/04/17.
 */
//GUI: base class for scene objects like entitiesSpawner, interactive objects, etc
window.cocos.cc.GameEntitySceneObjectType = {
    SPAWNER: "spawner",
    MOVINGBOX: "movingBox"
};


window.cocos.cc.GameEntitySceneObject = window.cocos.cc.Node.extend({
    _className: "GameEntitySceneObject",
    //GUI: custom
    _objectType: null,

    ctor: function(type){
        this._super();
        this._objectType = type;
        this.setTag(window.cocos.cc.kGameEntitySceneObjectTag);
    },

    init: function(){
        this._super();
        return true;
    }
});

window.cocos.cc.GameEntitySceneObject.create = function(type){
    return new window.cocos.cc.GameEntitySceneObject(type);
};


window.cocos.cc.GameEntitySpawnerObject = window.cocos.cc.GameEntitySceneObject.extend({
    _className: "GameEntitySpawnerObject",
    //GUI: custom
    //GUI: values from scene
    entityCount: 0, //GUI: how many entities to spawn
    delay: 0.0, //GUI: dt between one spawn and the next one
    entityType: null, //GUI: identifier of the type of enemy to spawn
    entityScale: 1,
    layerWhereSpawn: null,
    //GUI: for updates
    currentTime: 0,
    currentCount: 0,

    ctor: function(params){
        this._super(window.cocos.cc.GameEntitySceneObjectType.SPAWNER);
        this.entityCount = params["count"] ? params["count"] : 1;
        this.delay = params["delay"] ? params["delay"] : 0;
        this.entityScale = params["entityScale"] ? params["entityScale"] : 1;
        this.entityType = params["entityType"];
        this.layerWhereSpawn = params["layerName"] ? params["layerName"] : null;
        this.currentTime = 0;
        this.currentCount = 0;
        this.scheduleUpdate();
    },

    init: function(){
        this._super();

        return true;
    },

    update: function(dt){
        if(this.currentCount < this.entityCount){
            if(this.currentTime >= this.delay){
                this.spawnEntity();
                this.currentTime = 0;
            }
            else{
                this.currentTime += dt;
            }
        }
        else{
            this.unscheduleUpdate();
        }
    },
    
    spawnEntity: function(){
        if(this.entityType != null){
            //GUI: looking for class in cocos
            var template = window.cocos.cc[this.entityType];
            if(template != null){
                if(template.createStandard != null){
                    var scene = window.cocos.cc.director.getRunningScene();
                    if(scene) {
                        var entity = template.createStandard();
                        //entity.addEventListener("load", this.onEntityLoaded, entity);
                        //GUI: set initial position. Position will be corrected after loading
                        entity.setPosition(this.getPosition().x, this.getPosition().y);
                        entity.setScale(this.entityScale);
                        //GUI: if layer to spawn is defined, spawn in selected layer, else spawn in scene
                        var nodeWhereSpawn = scene;
                        if(typeof scene.getTilemap !== 'undefined' && scene.getTilemap() != null && this.layerWhereSpawn != null){
                            nodeWhereSpawn = scene.getTilemap().getLayer(this.layerWhereSpawn);
                            nodeWhereSpawn = nodeWhereSpawn || scene;
                        }
                        nodeWhereSpawn.addChild(entity, 1);
                        var rect = entity.collisionSize || entity._contentSize;
                        entity.setPosition(entity.getPosition().x, entity.getPosition().y + rect.height/2 * entity.getScaleY());
                        //window.cocos.cc.director.getScheduler().scheduleCallbackForTarget(entity, this.onEntityLoaded, 0.1, false, 0, false);
                        this.currentCount++;
                    }
                }
            }
        }
        else{
            this.unscheduleUpdate();
        }
    },

    onEntityLoaded: function(){
        //GUI: because the call was made by passing entity as target, this now refers to the loaded entity, not to the spawner
        //console.log(this.getContentSize());
        //this.setPosition(this.getPosition().x, this.getPosition().y + this.getContentSize().height/2 * this.getScaleY());
    }
});

window.cocos.cc.GameEntitySpawnerObject.create = function(params){
    return new window.cocos.cc.GameEntitySpawnerObject(params);
};