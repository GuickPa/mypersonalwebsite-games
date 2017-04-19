/**
 * Created by guglielmo on 09/04/17.
 */
window.cocos.cc.kIAStateIdle = "idle";
window.cocos.cc.kIAStateWalk = "walk";
window.cocos.cc.kIAStateAttack = "attack";
window.cocos.cc.kIAStateDeath = "death";
window.cocos.cc.kIAStateDead = "dead";
window.cocos.cc.kIAStateReborn = "reborn";
window.cocos.cc.kIAStateRun = "run";
window.cocos.cc.kIAStateJump = "jump";
window.cocos.cc.kIAStateSlide = "slide";

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
    checkDistanceWithEnemy: function(tagMask){
        if(this.entity != null) {
            var scene = window.cocos.cc.director.getRunningScene();
            if (scene) {
                var children = scene.getChildren();
                for (var index = 0; index < children.length; index++) {
                    var child = children[index];
                    if (child.getTag() & tagMask) {
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

    //GUI: return a value that can be -1 (left) or 1 (right). false if no player were found
    enemyDirection: function(tagMask){
        if(this.entity != null) {
            var scene = window.cocos.cc.director.getRunningScene();
            if (scene) {
                var children = scene.getChildren();
                for (var index = 0; index < children.length; index++) {
                    var child = children[index];
                    if (child.getTag() & tagMask) {
                        //GUI: calc the distance vector between entity owner of thi state and founded enemy node
                        var dx = child.getPosition().x - this.entity.getPosition().x;
                        var dist = dx/Math.abs(dx);
                        return dist;
                    }
                }
            }
        }
        //GUI: unable to find distance
        return false;
    }
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
        if(this.entity.weapon != null) {
            var dist = this.checkDistanceWithEnemy(window.cocos.cc.kGameEntityPlayerTag);
            if (dist != false) {
                if (dist <= this.entity.weapon.range) {
                    this.entity.stateMachine.changeState(window.cocos.cc.kIAStateAttack);
                }
                else{
                    this.entity.stateMachine.changeState(window.cocos.cc.kIAStateWalk);
                }
            }
            else{
                //GUI: no enemies: just walk (this happens when the player is dead)
                this.entity.stateMachine.changeState(window.cocos.cc.kIAStateWalk);
            }
        }
        else{
            this.entity.stateMachine.changeState(window.cocos.cc.kIAStateWalk);
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
        if(this.entity.weapon != null) {
            var dist = this.checkDistanceWithEnemy(window.cocos.cc.kGameEntityPlayerTag);
            if (dist != false) {
                if (dist <= this.entity.weapon.range) {
                    this.entity.stateMachine.changeState(window.cocos.cc.kIAStateAttack);
                }
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
            this.entity.velocity = window.cocos.cc.p(0, 0);
            if(this.entity.weapon != null) {
                //GUI: get enemy direction and flips the sprite if needed
                var dir = this.enemyDirection(window.cocos.cc.kGameEntityPlayerTag);
                if (dir != false) {
                    this.entity.setFlippedX(dir < 0);
                    if (this.entity.weapon.canFire()) {
                        this.entity.playAnimation("attack", false, this.endAnimationCallback, this);
                    }
                }
                else{
                    this.entity.stateMachine.changeState(window.cocos.cc.kIAStateWalk);
                }
            }
            else{
                this.entity.stateMachine.changeState(window.cocos.cc.kIAStateWalk);
            }
        }
    },

    onExit: function(){
        this._super();
    },

    endAnimationCallback: function(){
        if(this.entity.weapon != null)
            this.entity.weapon.fire()
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

window.cocos.cc.IAStateDeath = window.cocos.cc.IAState.extend({
    _className: "IAStateDeath",
    //GUI: custom
    //GUI: state name
    stateName: window.cocos.cc.kIAStateDeath,

    ctor: function(){
        window.cocos.cc.IAState.prototype.ctor.call();
        this.init();
    },

    init: function(){
        this._super();
    },

    update: function(dt){
        this._super(dt);

    },

    onEnter: function(){
        this._super();
        if(this.entity != null) {
            this.entity.velocity = window.cocos.cc.p(0, this.entity.velocity.y);
            this.entity.playAnimation("dead", false, this.endAnimationCallback, this);
        }
    },

    onExit: function(){
        this._super();
    },

    endAnimationCallback: function(){
        this.entity.stateMachine.changeState(window.cocos.cc.kIAStateDead);
    },

    ////////////////////////////////////////////////////////////////////
    //GUI: events on movements
    onGroundTouched: function(entity){

    },

    onHitEvent: function(entity){

    },
});
window.cocos.cc.IAStateDeath.create = function () {
    return new window.cocos.cc.IAStateDeath();
};

//GUI: stay dead for a while, then... (It's a zombie, dude!)
window.cocos.cc.IAStateDead = window.cocos.cc.IAState.extend({
    _className: "IAStateDead",
    //GUI: custom
    //GUI: state name
    stateName: window.cocos.cc.kIAStateDead,
    waitTime: 5, //GUI: seconds
    currentWaitTime: 0,

    ctor: function(){
        window.cocos.cc.IAState.prototype.ctor.call();
        this.init();
    },

    init: function(){
        this._super();
        this.waitTime = 5;
        this.currentWaitTime = 0;
    },

    update: function(dt){
        this._super(dt);
        this.currentWaitTime += dt;
        //GUI: check if this waited enough
        if(this.currentWaitTime >= this.waitTime){
            this.entity.stateMachine.changeState(window.cocos.cc.kIAStateReborn);
        }
    },

    onEnter: function(){
        this._super();
        this.waitTime = 5;
        this.currentWaitTime = 0;
        if(this.entity != null) {
            this.entity.velocity = window.cocos.cc.p(0, this.entity.velocity.y);

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

    },
});
window.cocos.cc.IAStateDead.create = function () {
    return new window.cocos.cc.IAStateDead();
};

//GUI: like a phoenix... or a zombie you didn't shot at the head
window.cocos.cc.IAStateReborn = window.cocos.cc.IAState.extend({
    _className: "IAStateReborn",
    //GUI: custom
    //GUI: state name
    stateName: window.cocos.cc.kIAStateReborn,

    ctor: function(){
        window.cocos.cc.IAState.prototype.ctor.call();
        this.init();
    },

    init: function(){
        this._super();
    },

    update: function(dt){
        this._super(dt);
    },

    onEnter: function(){
        this._super();
        if(this.entity != null) {
            this.entity.velocity = window.cocos.cc.p(0, this.entity.velocity.y);
            this.entity.playAnimation("reborn", false, this.endAnimationCallback, this);
        }
    },

    onExit: function(){
        this._super();
    },

    endAnimationCallback: function(){
        this.entity.getBackInLife();
    },

    ////////////////////////////////////////////////////////////////////
    //GUI: events on movements
    onGroundTouched: function(entity){

    },

    onHitEvent: function(entity){

    },
});
window.cocos.cc.IAStateReborn.create = function () {
    return new window.cocos.cc.IAStateReborn();
};
