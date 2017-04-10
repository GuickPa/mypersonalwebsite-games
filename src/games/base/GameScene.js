/**
 * Created by guglielmo on 06/04/17.
 */

window.cocos.cc.GameScene = window.cocos.cc.Scene.extend({
    _className: "GameScene",
    //GUI: custom:
    tilemap: null,
    
    ctor:function () {
        window.cocos.cc.Scene.prototype.ctor.call(this);

    }
});
