/**
 * Created by guglielmo on 20/04/17.
 */
//GUI: EnemySaw - subclass of enemy
window.cocos.cc.EnemySaw = window.cocos.cc.Enemy.extend({
    _className: "EnemySaw",
    //GUI: custom
    canFire: true,

    ctor: function (fileName, rect, rotated) {
        //GUI: call super
        this.addLoadedEventListener(this.loadedCallback, this);
        this._super(fileName, rect, rotated);
        this.buildAnimations();
    },

    init: function(fileName, rect, rotated){
        var self = this;
        self._super(fileName, rect, rotated);
        self.stateMachine = null;
        self.weapon = null;//window.cocos.cc.ZombieClaw.create(self, window.cocos.cc.kGameEntityPlayerTag);
        self.lifePoints = -1;
        self.gravity = window.cocos.cc.p(0,0);
        self.velocity = window.cocos.cc.p(0,0);
        self.setTag(window.cocos.cc.kGameEntitySceneObjectTag);
        return true;
    },

    loadedCallback: function(){
        console.log("loaded");
    },

    onEnter: function(){
        this._super();
        this.collisionSize = null;
        //GUI: run rotate action
        var rotate = window.cocos.cc.rotateBy(0.2, - Math.PI * 20);
        rotate.repeatForever();
        this.runAction(rotate);
    },

    buildAnimations: function(){
        self.animations = null;
    },

    playAnimation : function(name, loop, endCallback, caller){

    },

    update: function (dt) {
        this._super(dt);
    },

    move: function(dt) {
        this.velocity.x += this.gravity.x;
        this.velocity.y += this.gravity.y;
        var dx = this.velocity.x * dt;
        var dy = this.velocity.y * dt;
        var p = this.getPosition();
        this.setPosition(p.x + dx, p.y + dy);
    },

    moveX: function(dx, dy, dt, p, obstacles, tileSize){

    },

    moveY: function(dx, dy, dt, p, obstacles, tileSize){

    },

    onGroundTouched: function(entity){

    },
});

window.cocos.cc.EnemySaw.create = function (fileName, rect, rotated) {
    return new window.cocos.cc.EnemySaw(fileName, rect, rotated);
};

window.cocos.cc.EnemySaw.createStandard = function () {
    return new window.cocos.cc.EnemySaw("assets/games/tiles/scifi/Saw.png");
};