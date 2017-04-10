/**
 * Created by guglielmo on 09/04/17.
 */
//GUI: Enemy - GameEntityEnemy
window.cocos.cc.Enemy = window.cocos.cc.GameEntity.extend({
    _className: "Enemy",
    //GUI: custom
    stateMachine: null,

    ctor: function (fileName, rect, rotated) {
        //GUI: call super
        window.cocos.cc.GameEntity.prototype.ctor.call(this, fileName, rect, rotated);
        this.buildAnimations();
    },

    init: function(){
        var self = this;
        window.cocos.cc.GameEntity.prototype.init.call(self);
        self.setTag(window.cocos.cc.kGameEntityEnemyTag);
        this.stateMachine = window.cocos.cc.IAStateMachine.create(this);
        return true;
    },

    onEnter: function(){
        this._super();
        this.collisionSize = new window.cocos.cc.Size(276, 488);
        this.playAnimation("idle", true);
    },

    buildAnimations: function(){
        
    },

    update: function (dt) {
        if(this.stateMachine != null){
            this.stateMachine.update(dt);
        }
        this.move(dt);
    },

    ////////////////////////////////////////////////////////////////////
    //GUI: events on movements
    onGroundTouched: function(entity){
        if(this.stateMachine != null){
            this.stateMachine.onGroundTouched(entity);
        }
    },

    onHitEvent: function(entity){
        if(this.stateMachine != null){
            this.stateMachine.onHitEvent(entity);
        }
    },
});

window.cocos.cc.Enemy.create = function (fileName, rect, rotated) {
    return new window.cocos.cc.Enemy(fileName, rect, rotated);
};
window.cocos.cc.Enemy.createWithTexture = window.cocos.cc.Enemy.create;
window.cocos.cc.Enemy.createWithSpriteFrameName = window.cocos.cc.Enemy.create;
window.cocos.cc.Enemy.createWithSpriteFrame = window.cocos.cc.Enemy.create;