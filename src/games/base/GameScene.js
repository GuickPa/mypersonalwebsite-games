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
    }
});
