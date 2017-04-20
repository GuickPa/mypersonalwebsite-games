/**
 * Created by guglielmo on 06/04/17.
 */

window.cocos.cc.GameScene = window.cocos.cc.Scene.extend({
    _className: "GameScene",
    //GUI: custom:
    tilemap: null,
    totalSize: null,
    
    ctor:function () {
        this._super();
        this.setAnchorPoint(0, 0);
    },
    
    setTilemap: function(tilemap){
        this.tilemap = tilemap;
        if(this.tilemap != null){
            //GUI: get tile'size multiplied for tileMap scaling
            var size = this.tilemap.getTileSize();
            var sf = this.tilemap.getScale();
            size.width *= sf;
            size.height *= sf;
            this.totalSize = window.cocos.cc.size(size.width * this.tilemap._getMapWidth(), size.height * this.tilemap._getMapHeight());
        }
        else{
            this.totalSize = window.cocos.cc.director.getWinSize();
        }
    },

    setEntityPosition: function(entity, positionName){
        if(entity != null) {
            if (this.tilemap != null) {
                //GUI: check with objects
                var objectsGroups = this.tilemap.getObjectGroups();
                if (objectsGroups != null) {
                    var sf = this.tilemap.getScale();
                    //GUI: scroll the list of groups
                    for (var i = 0; i < objectsGroups.length; i++) {
                        var group = objectsGroups[i];
                        //GUI: interactive objects layer
                        if (group.groupName == 'objects') {
                            for (var i = 0; i < group._objects.length; i++) {
                                var obj = group._objects[i];
                                if (obj.name == positionName) {
                                    entity.setPosition(new window.cocos.cc.p(obj.x * sf, obj.y  * sf + entity.collisionSize.height/2 * entity.getScaleY()));                                    
                                    return;
                                }
                            }
                        }
                    }
                }
            }
            //GUI: default position
            entity.setPosition(0, 0);
        }
    },

    createSceneEntities: function(){
        if (this.tilemap != null) {
            //GUI: check with objects
            var objectsGroups = this.tilemap.getObjectGroups();
            if (objectsGroups != null) {
                var sf = this.tilemap.getScale();
                //GUI: scroll the list of groups
                for (var i = 0; i < objectsGroups.length; i++) {
                    var group = objectsGroups[i];
                    //GUI: interactive objects layer
                    if (group.groupName == 'objects') {
                        var types = window.cocos.cc.GameEntitySceneObjectType;
                        //GUI: get tile'size multiplied for tileMap scaling
                        var size = this.tilemap.getTileSize();
                        var sf = this.tilemap.getScale();
                        size.width *= sf;
                        size.height *= sf;
                        for (var i = 0; i < group._objects.length; i++) {
                            var obj = group._objects[i];
                            switch (obj.type){
                                case types.SPAWNER: {
                                    var position = new window.cocos.cc.p(obj.x * sf, obj.y * sf)
                                    this.createSpawner({"entityType": obj.entityType, "count": obj.count, "delay": obj.delay, "entityScale": obj.entityScale}, position);
                                }
                                    break;
                                
                            }
                        }
                    }
                }
            }
        }
    },
    
    createSpawner: function(params, position){
        if(params && params["entityType"] != null){
            var spawner = window.cocos.cc.GameEntitySpawnerObject.create(params);
            spawner.setPosition(position);
            this.addChild(spawner);
        }
    }
});
