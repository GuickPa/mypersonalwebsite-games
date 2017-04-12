/**
 * Created by guglielmo on 06/04/17.
 */

window.cocos.cc.GameScene = window.cocos.cc.Scene.extend({
    _className: "GameScene",
    //GUI: custom:
    tilemap: null,
    totalSize: null,
    
    ctor:function () {
        window.cocos.cc.Scene.prototype.ctor.call(this);

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

    setPlayerStartPosition: function(player){
        if(player != null) {
            if (this.tilemap != null) {
                //GUI: check with obstacles
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
                                if (obj.name == "entryPoint") {
                                    player.setPosition(new window.cocos.cc.p(obj.x * sf, obj.y  * sf + player.collisionSize.height/2 * player.getScaleY()));
                                    console.log(player.getPosition(), player.collisionSize.height);
                                    return;
                                }
                            }
                        }
                    }
                }
                else {

                }
            }

            player.setPosition(0, 0);
        }
    }
});
