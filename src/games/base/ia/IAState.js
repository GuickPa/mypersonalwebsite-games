/**
 * Created by guglielmo on 09/04/17.
 */
window.cocos.cc.kIAStateIdle = "idle";
window.cocos.cc.kIAStateWalk = "walk";
window.cocos.cc.kIAStateAttack = "attack";

window.cocos.cc.IAState = window.cocos.cc.Class.extend({
    _className: "IAState",
    //GUI: custom
    //GUI: state name
    stateName: null,
    //GUI: reference to entity 
    entity: null,
    
    ctor: function(){

    },

    init: function(){

    },

    update: function(dt){

    },

    setEntity: function(entity){
        this.entity = entity;
    },
    
    onEnter: function(){
        //console.log("Enter state", this.stateName);
    },
    
    onExit: function(){
        //console.log("Exit state", this.stateName);
    },

    ////////////////////////////////////////////////////////////////////
    //GUI: events on movements
    onGroundTouched: function(entity){

    },

    onHitEvent: function(entity){

    },

    //GUI: custom: look for a player and calc the distance
    checkDistanceWithEnemy: function(){
        if(this.entity != null) {
            var scene = window.cocos.cc.director.getRunningScene();
            if (scene) {
                var children = scene.getChildren();
                for (var index = 0; index < children.length; index++) {
                    var child = children[index];
                    if (window.cocos.cc.Player.prototype.isPrototypeOf(child)) {
                        //GUI: calc the distance vector between entity owner of thi state and founded enemy node
                        var dv = window.cocos.cc.p(child.getPosition().x - this.entity.getPosition().x, child.getPosition().y - this.entity.getPosition().y);
                        var dist = Math.sqrt((dv.x * dv.x) + (dv.y * dv.y));
                        return dist;
                    }
                }
            }
        }
        //GUI: unable to find distance
        return false;
    },
});
window.cocos.cc.IAState.create = function () {
    return new window.cocos.cc.IAState();
};

window.cocos.cc.IAStateIdle = window.cocos.cc.IAState.extend({
    _className: "IAStateIdle",
    //GUI: custom
    //GUI: state name
    stateName: window.cocos.cc.kIAStateIdle,
    //GUI: reference to entity
    entity: null,

    ctor: function(){
        window.cocos.cc.IAState.prototype.ctor.call();
    },

    update: function(dt){
        this._super(dt);
        var dist = this.checkDistanceWithEnemy();
        if(dist != false){
            if(dist > 10){
                this.entity.stateMachine.changeState(window.cocos.cc.kIAStateWalk);
            }
        }
    },

    onEnter: function(){
        this._super();
        if(this.entity != null) {
            this.entity.playAnimation("idle", false, this.endAnimationCallback, this);
            this.entity.velocity = window.cocos.cc.p(0, 0);
        }
    },

    onExit: function(){
        this._super();
    },

    endAnimationCallback: function(){
        var dist = this.checkDistanceWithEnemy();
        if(dist != false){
            if(dist <= 10){
                this.entity.stateMachine.changeState(window.cocos.cc.kIAStateAttack);
            }
            else{
                this.entity.stateMachine.changeState(window.cocos.cc.kIAStateIdle);
            }
        }
    },
});
window.cocos.cc.IAStateIdle.create = function () {
    return new window.cocos.cc.IAStateIdle();
};

window.cocos.cc.IAStateWalk = window.cocos.cc.IAState.extend({
    _className: "IAStateWalk",
    //GUI: custom
    //GUI: state name
    stateName: window.cocos.cc.kIAStateWalk,

    ctor: function(){
        window.cocos.cc.IAState.prototype.ctor.call();
    },

    update: function(dt){
        this._super(dt);
        var dist = this.checkDistanceWithEnemy();
        if(dist != false){
            if(dist <= 10){
                this.entity.stateMachine.changeState(window.cocos.cc.kIAStateAttack);
            }
        }
    },

    onEnter: function(){
        this._super();
        if(this.entity != null) {
            this.entity.playAnimation("walk", true);
            if (this.entity.isFlippedX()) {
                this.entity.velocity = window.cocos.cc.p(-this.entity.speed, 0);
            }
            else {
                this.entity.velocity = window.cocos.cc.p(this.entity.speed, 0);
            }
        }
    },

    onExit: function(){
        this._super();
    },

    ////////////////////////////////////////////////////////////////////
    //GUI: events on movements
    onGroundTouched: function(entity){

    },

    onHitEvent: function(entity){
        if(this.entity != null) {
            //GUI: inverts texture flipping and velocity
            this.entity.setFlippedX(!this.entity.isFlippedX());
            this.entity.velocity = window.cocos.cc.p(-this.entity.velocity.x, 0);
        }
    },
});
window.cocos.cc.IAStateWalk.create = function () {
    return new window.cocos.cc.IAStateWalk();
};

window.cocos.cc.IAStateAttack = window.cocos.cc.IAState.extend({
    _className: "IAStateAttack",
    //GUI: custom
    //GUI: state name
    stateName: window.cocos.cc.kIAStateAttack,

    ctor: function(){
        window.cocos.cc.IAState.prototype.ctor.call();
        this.init();
    },

    init: function(){
        this._super();
        this.endAttackFlag = false;
    },

    update: function(dt){
        this._super(dt);

    },

    onEnter: function(){
        this._super();
        if(this.entity != null) {
            var self = this;
            this.entity.velocity = window.cocos.cc.p(0, 0);
            this.entity.playAnimation("attack", false, this.endAnimationCallback, this);
        }
    },

    onExit: function(){
        this._super();
    },

    endAnimationCallback: function(){
        this.entity.stateMachine.changeState(window.cocos.cc.kIAStateIdle);
    },

    ////////////////////////////////////////////////////////////////////
    //GUI: events on movements
    onGroundTouched: function(entity){

    },

    onHitEvent: function(entity){
        if(this.entity != null) {
            //GUI: inverts texture flipping and velocity
            this.entity.setFlippedX(!this.entity.isFlippedX());
            this.entity.velocity = window.cocos.cc.p(-this.entity.velocity.x, 0);
        }
    },
});
window.cocos.cc.IAStateAttack.create = function () {
    return new window.cocos.cc.IAStateAttack();
};
