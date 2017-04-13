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
        window.cocos.cc.GameEntity.prototype.init.call(this);
        this.setTag(window.cocos.cc.kGameEntityEnemyTag);
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

    ////////////////////////////////////////////////////////////////////
    //GUI: handling life points
    onWeaponHit: function(weapon, damagePoints){
        this._super(weapon, damagePoints);
    },

    onZeroLifePoints: function(){
        //GUI: change tag to avoid collisions as it was active
        this.setTag(window.cocos.cc.kGameEntityDeadEnemyTag);
        if(this.stateMachine){
            this.stateMachine.changeState(window.cocos.cc.kIAStateDeath);
        }
    },

    getBackInLife: function(){
        this.setTag(window.cocos.cc.kGameEntityEnemyTag);
        this.lifePoints = 6;
        if(this.stateMachine){
            this.stateMachine.changeState(window.cocos.cc.kIAStateIdle);
        }
    },

});

window.cocos.cc.Enemy.create = function (fileName, rect, rotated) {
    return new window.cocos.cc.Enemy(fileName, rect, rotated);
};
window.cocos.cc.Enemy.createWithTexture = window.cocos.cc.Enemy.create;
window.cocos.cc.Enemy.createWithSpriteFrameName = window.cocos.cc.Enemy.create;
window.cocos.cc.Enemy.createWithSpriteFrame = window.cocos.cc.Enemy.create;