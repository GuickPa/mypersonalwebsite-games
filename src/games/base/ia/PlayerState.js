/**
 * Created by guglielmo on 19/04/17.
 */
//GUI: Player state: player's character's state change based on input from user. Each state handle input on its own way
window.cocos.cc.PlayerState = window.cocos.cc.IAState.extend({
    _className: "PlayerState",
    //GUI: custom

    ctor: function(){
        window.cocos.cc.IAState.prototype.ctor.call();
    },

    update: function(dt){
        this._super(dt);
    },

    onEnter: function(){
        this._super();
        //console.log("Enter state", this.stateName);
    },

    onExit: function(){
        this._super();
        //console.log("Exit state", this.stateName);
    },

    inputUpdate: function(value){

    },

    onKeyPressed: function(event,button,mask){

    },

    onKeyReleased: function(event,button,mask){

    },
});

window.cocos.cc.PlayerState.create = function(){
    return new window.cocos.cc.PlayerState();
}

window.cocos.cc.PlayerStateIdle = window.cocos.cc.PlayerState.extend({
    _className: "PlayerStateIdle",
    //GUI: custom
    stateName: window.cocos.cc.kIAStateIdle,

    ctor: function(){
        window.cocos.cc.PlayerState.prototype.ctor.call();
    },

    update: function(dt){
        this._super(dt);
    },

    onEnter: function(){
        this._super();
        this.entity.playAnimation("idle", true);
        this.entity.velocity.x = 0;
    },

    onExit: function(){
        this._super();
    },

    inputUpdate: function(value){
        this._super(value);
        var mask = window.cocos.cc.PlayerKeyMask;
        //GUI: for movement, right has priority to left
        if(value & (mask.left |mask.right)){
            this.entity.stateMachine.changeState(window.cocos.cc.kIAStateRun);
        }
        if(value & mask.up){
            this.entity.stateMachine.changeState(window.cocos.cc.kIAStateJump);
        }
        //GUI: slide
        if(value & mask.down){
            this.entity.stateMachine.changeState(window.cocos.cc.kIAStateSlide);
        }
        //GUI: fire
        if(value & mask.fire){
            this.entity.fire(false);
        }
    },
    
    onKeyPressed: function(event,button,mask){
        
    },

    onKeyReleased: function(event,button,mask){

    },
});

window.cocos.cc.PlayerStateIdle.create = function(){
    return new window.cocos.cc.PlayerStateIdle();
}

window.cocos.cc.PlayerStateRun = window.cocos.cc.PlayerState.extend({
    _className: "PlayerStateRun",
    //GUI: custom
    stateName: window.cocos.cc.kIAStateRun,

    ctor: function(){
        window.cocos.cc.PlayerState.prototype.ctor.call();
    },

    update: function(dt){
        this._super(dt);
    },

    onEnter: function(){
        this._super();
        this.entity.playAnimation("run", true);
    },

    onExit: function(){
        this._super();
    },

    inputUpdate: function(value){
        this._super(value);
        var mask = window.cocos.cc.PlayerKeyMask;
        //GUI: for movement, right has priority to left
        if(value & mask.right){
            this.entity.setFlippedX(false);
            this.entity.velocity.x = this.entity.speed;
        }
        else if(value & mask.left){
            this.entity.setFlippedX(true);
            this.entity.velocity.x = -this.entity.speed;
        }
        if(value & mask.up){
            this.entity.stateMachine.changeState(window.cocos.cc.kIAStateJump);
        }
        //GUI: slide
        if(value & mask.down){
            this.entity.stateMachine.changeState(window.cocos.cc.kIAStateSlide);
        }
        //GUI: fire
        if(value & mask.fire){
            this.entity.fire(true);
        }

        if(value == 0){
            this.entity.stateMachine.changeState(window.cocos.cc.kIAStateIdle);
        }
    },

    onKeyPressed: function(event,button,mask){

    },

    onKeyReleased: function(event,button,mask){

    },
});

window.cocos.cc.PlayerStateRun.create = function(){
    return new window.cocos.cc.PlayerStateRun();
}

window.cocos.cc.PlayerStateJump = window.cocos.cc.PlayerState.extend({
    _className: "PlayerStateJump",
    //GUI: custom
    stateName: window.cocos.cc.kIAStateJump,
    velocityXFactor: 1.5,

    ctor: function(){
        window.cocos.cc.PlayerState.prototype.ctor.call();
    },

    update: function(dt){
        this._super(dt);
    },

    onEnter: function(){
        this._super();
        this.entity.onGround = false;
        this.entity.velocity.y += this.entity.jumpForce;
        this.entity.playAnimation("jump", false);
    },

    onExit: function(){
        this._super();
    },

    inputUpdate: function(value){
        this._super(value);
        var mask = window.cocos.cc.PlayerKeyMask;
        //GUI: if still on air, it can move left and right
        if(!this.entity.onGround) {
            //GUI: for movement, right has priority to left
            if (value & mask.right) {
                this.entity.setFlippedX(false);
                this.entity.velocity.x = this.entity.speed * this.velocityXFactor;
            }
            else if (value & mask.left) {
                this.entity.setFlippedX(true);
                this.entity.velocity.x = -this.entity.speed * this.velocityXFactor;
            }
        }
        else{
            //GUI: if jump input, jump again and move left or right
            if(value & mask.up){
                this.entity.stateMachine.changeState(window.cocos.cc.kIAStateJump);
            }
            else{
                //GUI: if no jump input, change state (run or idle)
                if(value & (mask.left | mask.right)){
                    this.entity.stateMachine.changeState(window.cocos.cc.kIAStateRun);
                }
                if(value == 0){
                    this.entity.stateMachine.changeState(window.cocos.cc.kIAStateIdle);
                }
            }
        }
    },

    onKeyPressed: function(event,button,mask){

    },

    onKeyReleased: function(event,button,mask){

    },
});

window.cocos.cc.PlayerStateJump.create = function(){
    return new window.cocos.cc.PlayerStateJump();
}

window.cocos.cc.PlayerStateSlide = window.cocos.cc.PlayerState.extend({
    _className: "PlayerStateSlide",
    //GUI: custom
    stateName: window.cocos.cc.kIAStateSlide,
    currentSlideTime: 0,

    ctor: function(){
        window.cocos.cc.PlayerState.prototype.ctor.call();
        this.currentSlideTime = 0;
    },

    update: function(dt){
        this._super(dt);
        this.currentSlideTime += dt;
        if(this.currentSlideTime >= this.entity.getSlideDuration()){
            this.entity.stateMachine.changeState(window.cocos.cc.kIAStateIdle);
        }
    },

    onEnter: function(){
        this._super();
        this.entity.slide();
        this.currentSlideTime = 0;
        this.entity.isSliding = true;
    },

    onExit: function(){
        this._super();
        this.entity.isSliding = false;
    },

    inputUpdate: function(value){
        this._super(value);
    },

    onKeyPressed: function(event,button,mask){
        this._super(event,button,mask);
        var playerMask = window.cocos.cc.PlayerKeyMask;
        //GUI: if no jump input, change state (run or idle)
        if(mask & (playerMask.up)){
            this.entity.stateMachine.changeState(window.cocos.cc.kIAStateJump);
        }
        else if(mask & (playerMask.left | playerMask.right)){
            this.entity.stateMachine.changeState(window.cocos.cc.kIAStateRun);
        }
        if(mask == 0){
            this.entity.stateMachine.changeState(window.cocos.cc.kIAStateIdle);
        }

    },

    onKeyReleased: function(event,button,mask){

    },

    onHitEvent: function(entity){
        this._super(entity);
        this.entity.stateMachine.changeState(window.cocos.cc.kIAStateIdle);
    },
});

window.cocos.cc.PlayerStateSlide.create = function(){
    return new window.cocos.cc.PlayerStateSlide();
}

window.cocos.cc.PlayerStateDeath = window.cocos.cc.PlayerState.extend({
    _className: "PlayerStateDeath",
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
            this.entity.setTag(window.cocos.cc.kGameEntityDeadPlayerTag);
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
window.cocos.cc.PlayerStateDeath.create = function () {
    return new window.cocos.cc.PlayerStateDeath();
};

//GUI: stay dead for a while, then... (It's a zombie, dude!)
window.cocos.cc.PlayerStateDead = window.cocos.cc.PlayerState.extend({
    _className: "PlayerStateDead",
    //GUI: custom
    //GUI: state name
    stateName: window.cocos.cc.kIAStateDead,

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
        }
        //GUI: broadcast dead event
        var gm = window.cocos.cc.game.gameManager;
        if(gm != null){
            gm.broadcastEvent(window.cocos.cc.GameManagerEvents.kGameManagerEventPlayerDead, this.entity);
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
window.cocos.cc.PlayerStateDead.create = function () {
    return new window.cocos.cc.PlayerStateDead();
};