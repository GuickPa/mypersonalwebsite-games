/**
 * Created by guglielmo on 27/04/17.
 */
//GUI: Moving box
window.cocos.cc.GameEntityMovingBox = window.cocos.cc.GameEntitySceneObject.extend({
    _className: "GameEntityMovingBox",
    //GUI: custom
    tile: null, 
    dx: 0,
    dy: 0,
    dt: 0,
    maxDX: 0,
    maxDY: 0,
    maxDT: 0,
    velocity: null,

    ctor: function (tile, params) {
        //GUI: call super
        this._super();
        this.tile = tile,
        this.maxDX = params.dx;
        this.maxDY = params.dy;
        this.maxDT = params.time;
        this.velocity = window.cocos.cc.p(this.maxDX/this.maxDT, this.maxDY/this.maxDT);
        this.scheduleUpdate();
    },

    init: function(){
        this._super();
        return true;
    },

    update: function (dt) {
        this._super(dt);
        this.move(dt);
    },

    move: function(dt){        
        if(this.tile) {
            var dx = this.velocity.x * dt;
            var dy = this.velocity.y * dt;
            var p = this.tile.getPosition();
            this.tile.setPosition(p.x + dx, p.y + dy);
            this.dx += Math.abs(dx);
            if(this.dx >= this.maxDX){
                this.dx = 0;
                this.velocity.x *= -1;
            }
            this.dy += Math.abs(dy);
            if(this.dy >= this.maxDY){
                this.dy = 0;
                this.velocity.y *= -1;
            }
        }
    }
});
window.cocos.cc.GameEntityMovingBox.create = function (tile, params) {
    return new window.cocos.cc.GameEntityMovingBox(tile, params);
};