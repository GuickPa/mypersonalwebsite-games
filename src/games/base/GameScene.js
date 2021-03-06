/**
 * Created by guglielmo on 06/04/17.
 */

window.cocos.cc.GameScene = window.cocos.cc.Scene.extend({
    _className: "GameScene",
    //GUI: custom:
    tilemap: null,
    totalSize: null,
    platforms: null,
    
    ctor:function () {
        this._super();
        this.platforms = [];
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
    
    getTilemap: function(){
        return this.tilemap;
    },
    
    getPlatforms: function(){
        return this.platforms;
    },

    getChildrenByTagMask: function(tagMask, recursive){
        var list = [];
        if(recursive == null || !recursive) {
            var children = this.getChildren();
            for (var index = 0; index < children.length; index++){
                var child = children[index];
                if (child.getTag() != -1 && (child.getTag() & tagMask)) {
                    list.push(child);
                }
            }

            return list;
        }

        return this.getChildrenByTagMaskRecursive(tagMask, null);
    },

    getChildrenByTagMaskRecursive: function(tagMask, child){
        if (child == null){
          child = this;
        }
        //GUI: list wher add node and to be returned as result
        var list = [];
        var children = child.getChildren();
        for (var index = 0; index < children.length; index++){
            var node = children[index];
            if(node.getTag() != -1 && (node.getTag() & tagMask)){
                list.push(node);
            }
            //GUI: search in node
            var nodeList = this.getChildrenByTagMaskRecursive(tagMask, node);
            if(nodeList && nodeList.length > 0) {
                Array.prototype.push.apply(list,nodeList);
            }
        }

        return list;
    },

    createPlayer: function(){
        var player = window.cocos.cc.Player.create("assets/games/player/Idle (1).png");
        var nodeWhereSpawn = this;
        if(this.getTilemap() != null){
            nodeWhereSpawn = this.getTilemap().getLayer("entities");
            nodeWhereSpawn = nodeWhereSpawn || this;
        }
        nodeWhereSpawn.addChild(player, 1);
        return player;
    },

    setEntityPosition: function(entity, positionName){
        if(entity != null) {
            if (this.tilemap != null) {
                //GUI: check with objects
                var objectsGroups = this.tilemap.getObjectGroups();
                if (objectsGroups != null) {
                    var sf = 1;//this.tilemap.getScale();
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
            this.createEntitiesFromObjectLayer();
            //GUI: check obstacles
            this.createSceneObjects()
        }
    },
    //GUI: check object layer for entities
    createEntitiesFromObjectLayer: function(){
        var objectsGroups = this.tilemap.getObjectGroups();
        if (objectsGroups != null) {
            //GUI: scroll the list of groups
            for (var i = 0; i < objectsGroups.length; i++) {
                var group = objectsGroups[i];
                //GUI: interactive objects layer
                if (group.groupName == 'objects') {
                    var types = window.cocos.cc.GameEntitySceneObjectType;
                    //GUI: get tile'size multiplied for tileMap scaling
                    var size = this.tilemap.getTileSize();
                    // var sf = this.tilemap.getScale();
                    // size.width *= sf;
                    // size.height *= sf;
                    var sf = 1;
                    for (var i = 0; i < group._objects.length; i++) {
                        var obj = group._objects[i];
                        switch (obj.type){
                            case types.SPAWNER: {
                                var position = new window.cocos.cc.p(obj.x * sf, obj.y * sf)
                                this.createSpawner({"entityType": obj.entityType, "count": obj.count, "delay": obj.delay, "entityScale": obj.entityScale, "layerName": obj.layerName}, position);
                            }
                                break;

                        }
                    }
                }
            }
        }
    },
    //GUI: check obstacle layer for scene objects
    createSceneObjects: function(){
        var layers = this.tilemap.allLayers();
        for (var i = 0; i < layers.length; i++) {
            var group = layers[i];
            //GUI: scroll tiles in layer
            var size = group.getLayerSize();
            for (var row = 0; row < size.height; row++) {
                for (var col = 0; col < size.width; col++) {
                    var tp = window.cocos.cc.p(col, row);
                    //GUI: get tile's properties
                    var gid = group.getTileGIDAt(tp);
                    var properties = this.tilemap.getPropertiesForGID(gid);
                    if (properties != null) {
                        var type = properties["entityType"];
                        if (type) {
                            var types = window.cocos.cc.GameEntitySceneObjectType;
                            switch (type) {
                                case types.MOVINGBOX:
                                {
                                    var tile = group.getTileAt(tp);
                                    var mb = window.cocos.cc.GameEntityMovingBox.create(tile, properties);
                                    group.addChild(mb);
                                    this.platforms.push(mb);
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
