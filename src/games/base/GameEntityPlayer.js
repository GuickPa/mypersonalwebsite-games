/**
 * Created by guglielmo on 29/03/17.
 */
//GUI: Player - GameEntity

//GUI: key mask
window.cocos.cc.PlayerKeyMask = {
    left: 0x1,
    up: 0x10,
    right: 0x100,
    down: 0x1000,
    jump: 0x10000,
    fire: 0x100000,
}

window.cocos.cc.Player = window.cocos.cc.GameEntity.extend({
    _className: "Player",
    //GUI: custom
    //GUI: pressed key mask
    keyMask: 0,
    isSliding: false,
    slideDuration: 1.5,

    ctor: function (fileName, rect, rotated) {
        //GUI: call super
        this._super(fileName, rect, rotated);
        this.buildAnimations();
        this.buildController();
    },

    init: function(fileName, rect, rotated){
        var self = this;
        self._super(fileName, rect, rotated);
        self.speed = 256 * 2.5;
        self.jumpForce = 256 * 9;
        self.setTag(window.cocos.cc.kGameEntityPlayerTag);
        self.weapon = window.cocos.cc.RobotLaserGun.create(self, window.cocos.cc.kGameEntityEnemyTag);
        self.lifePoints = 10;
        self.keyMask = 0;
        self.isSliding = false;
        self.stateMachine = window.cocos.cc.PlayerStateMachine.create(this);
        return true;
    },
    
    getSlideDuration: function(){
        return this.slideDuration;
    },

    onEnter: function(){
        this._super();
        this.collisionSize = new window.cocos.cc.Size(276, 488);
        if(this.stateMachine != null){
            this.stateMachine.changeState(window.cocos.cc.kIAStateIdle);
        }
        else{
            this.playAnimation("idle", true);
        }

        //GUI: ask to current scene to set its start position (need to be done here, after player was loaded)
        var scene = window.cocos.cc.director.getRunningScene();
        if(scene != null){
            if(typeof scene.setEntityPosition != 'undefined'){
                scene.setEntityPosition(this, "entryPoint");
            }
        }
    },

    buildAnimations: function(){
        this.animations = {};
        var idle = ["Idle (1)", "Idle (2)", "Idle (3)", "Idle (4)", "Idle (5)", "Idle (6)", "Idle (7)", "Idle (8)", "Idle (9)", "Idle (10)"];
        var run = ["Run (1)", "Run (2)", "Run (3)", "Run (4)", "Run (5)", "Run (6)", "Run (7)", "Run (8)"];
        var jump = ["Jump (1)", "Jump (2)", "Jump (3)", "Jump (4)", "Jump (5)", "Jump (6)", "Jump (7)", "Jump (8)", "Jump (9)", "Jump (10)"];
        var shoot = ["Shoot (1)", "Shoot (2)", "Shoot (3)", "Shoot (4)"];
        var runShoot = ["RunShoot (1)", "RunShoot (2)", "RunShoot (3)", "RunShoot (4)", "RunShoot (5)", "RunShoot (6)", "RunShoot (7)", "RunShoot (8)", "RunShoot (9)"];
        var dead = ["Dead (1)", "Dead (2)", "Dead (3)", "Dead (4)", "Dead (5)", "Dead (6)", "Dead (7)", "Dead (8)", "Dead (9)", "Dead (10)"];
        var slide = ["Slide (1)", "Slide (2)", "Slide (3)", "Slide (4)", "Slide (5)", "Slide (6)", "Slide (7)", "Slide (8)", "Slide (9)", "Slide (10)"];

        this.buildAnimation("idle", "assets/games/player", idle, 0.12);
        this.buildAnimation("run", "assets/games/player", run);
        this.buildAnimation("jump", "assets/games/player", jump, 0.05);
        this.buildAnimation("shoot", "assets/games/player", shoot);
        this.buildAnimation("runShoot", "assets/games/player", runShoot);
        this.buildAnimation("dead", "assets/games/player", dead);
        this.buildAnimation("reborn", "assets/games/player", dead.reverse());
        this.buildAnimation("slide", "assets/games/player", slide);
    },

    buildController: function() {

        this.registerForKeyboardEvents();

        // if ('mouse' in window.cocos.cc.sys.capabilities) {
        //     window.cocos.cc.eventManager.addListener({
        //         event: window.cocos.cc.EventListener.MOUSE,
        //         onMouseDown: function (key, event) {
        //             this.direction = 1
        //         },
        //         onMouseUp: function (key, event) {
        //             this.direction = 1
        //         }
        //     }, this);
        // }
    },

    update: function (dt) {
        if(this.stateMachine != null){
            this.stateMachine.inputUpdate(this.keyMask);
        }
        this._super(dt);
        this.move(dt);
    },

    fire: function(moving){
        //GUI: check if it can fire (canFire flag is to avoid continuos propagation of bullets)
        if(this.  onGround && this.weapon) {
            if(this.weapon.canFire()) {
                //GUI: make the weapon to fire
                var direction = window.cocos.cc.p(this.isFlippedX() ? -1 : 1, 0);
                this.weapon.fire(this.getPosition(), direction, this.getScale());
                //GUI: play fire animation
                if(moving){
                    this.playAnimation("runShoot", false, this.onEndFireAction, this);
                }
                else{
                    this.playAnimation("shoot", false, this.onEndFireAction, this);
                }
            }
        }
    },

    slide: function(moving){
        if(this.onGround && !this.isSliding){
            this.isSliding = true;
            this.playAnimation("slide", false);
            if(this.isFlippedX()){
                this.velocity.x = -this.speed * 2;
            }
            else{
                this.velocity.x = this.speed * 2;
            }
        }
    },

    onEndFireAction: function(){
        //GUI: read keymask
        var mask = window.cocos.cc.PlayerKeyMask;
        if(this.keyMask & (mask.right|mask.left))
            this.playAnimation("run", true);
        else
            this.playAnimation("idle", true);
    },

    onEndSlideAction: function(){
        //GUI: read keymask
        var mask = window.cocos.cc.PlayerKeyMask;
        if(this.keyMask & (mask.right|mask.left)) {
            this.playAnimation("run", true);
        }
        else {
            this.playAnimation("idle", true);
        }
        this.isSliding = false;
    },

    ////////////////////////////////////////////////////////////////////
    //GUI: handling life points
    onWeaponHit: function(weapon, damagePoints){
        this._super(weapon, damagePoints);
    },

    onZeroLifePoints: function(){
        //GUI: force change state to death
        if(this.stateMachine != null){
            this.stateMachine.changeState(window.cocos.cc.kIAStateDeath);
        }
    },

    onEndDeadAnimation: function(){
        
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //GUI: handling interactive objects in layer
    triggerObjectAction: function(obj){
        //GUI: add scripts to game manager
        //GUI: trigger action only if trigger is > 0
        if(obj.trigger > 0) {
            //GUI: mark object as triggered
            obj.trigger = 0;
            switch (obj.action) {
                case "changeLevel":
                {
                    //GUI: change level: first pause game, then change level
                    var pauseScript = window.cocos.cc.GameScript.create(window.cocos.cc.GameScriptType.PAUSEGAME, null);
                    var changeScene = window.cocos.cc.GameScript.create(window.cocos.cc.GameScriptType.CHANGESCENE, [obj.param0]);
                    window.cocos.cc.game.gameManager.addGameScript(pauseScript);
                    window.cocos.cc.game.gameManager.addGameScript(changeScene);
                }
                    break;
            }
        }
    },

    ////////////////////////////////////////////////////////////////////
    //GUI: handling keyboard events
    onKeyPressed: function (key, event) {
        if(this.isAlive()) {
            switch (key) {
                case 32:
                    //GUI: space
                    this.keyMask |= window.cocos.cc.PlayerKeyMask.fire;
                    break;
                case 37:
                    //GUI: left
                    this.keyMask |= window.cocos.cc.PlayerKeyMask.left;
                    break;
                case 38:
                    //GUI: Up
                    this.keyMask |= window.cocos.cc.PlayerKeyMask.up;
                    break;
                case 39:
                    //GUI: right
                    this.keyMask |= window.cocos.cc.PlayerKeyMask.right;
                    break;
                case 40:
                    //GUI: down
                    this.keyMask |= window.cocos.cc.PlayerKeyMask.down;
                    break;
            }
            
            if(this.stateMachine != null){
                this.stateMachine.onKeyPressed(event, key, this.keyMask);
            }
        }
    },

    onKeyReleased: function (key, event) {
       /* if(this.isAlive())*/ {
            switch (key) {
                case 32:
                    //GUI: space
                    //this.fire();
                    this.keyMask &= ~window.cocos.cc.PlayerKeyMask.fire;
                    break;
                case 37:
                    this.keyMask &= ~window.cocos.cc.PlayerKeyMask.left;
                    break;
                case 38:
                    //GUI: Up
                    this.keyMask &= ~window.cocos.cc.PlayerKeyMask.up;
                    break;
                case 39:
                    this.keyMask &= ~window.cocos.cc.PlayerKeyMask.right;
                    //GUI: if no keys are pressed, and there is no animation, play default (idle) animation
                    break;
                case 40:
                    //GUI: down
                    this.keyMask &= ~window.cocos.cc.PlayerKeyMask.down;
                    break;
            }

            if(this.stateMachine != null){
                this.stateMachine.onKeyReleased(event, key, this.keyMask);
            }
        }
    },

});

window.cocos.cc.Player.create = function (fileName, rect, rotated) {
    return new window.cocos.cc.Player(fileName, rect, rotated);
};
window.cocos.cc.Player.createWithTexture = window.cocos.cc.Player.create;
window.cocos.cc.Player.createWithSpriteFrameName = window.cocos.cc.Player.create;
window.cocos.cc.Player.createWithSpriteFrame = window.cocos.cc.Player.create;
