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
    fire: 0x100000
}

window.cocos.cc.Player = window.cocos.cc.GameEntity.extend({
    _className: "Player",
    //GUI: custom
    //GUI: pressed key mask
    keyMask: 0,

    ctor: function (fileName, rect, rotated) {
        //GUI: call super
        window.cocos.cc.GameEntity.prototype.ctor.call(this, fileName, rect, rotated);
        this.buildAnimations();
        this.buildController();
    },

    init: function(){
        var self = this;
        window.cocos.cc.GameEntity.prototype.init.call(self);
        self.speed = 100;
        self.setTag(window.cocos.cc.kGameEntityPlayerTag);
        self.weapon = window.cocos.cc.RobotLaserGun.create(self, window.cocos.cc.kGameEntityEnemyTag);
        self.lifePoints = 1;
        self.keyMask = 0;
        return true;
    },

    onEnter: function(){
        this._super();
        this.collisionSize = new window.cocos.cc.Size(276, 488);
        this.playAnimation("idle", true);

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

        this.buildAnimation("idle", "assets/games/player", idle, 0.12);
        this.buildAnimation("run", "assets/games/player", run);
        this.buildAnimation("jump", "assets/games/player", jump, 0.05);
        this.buildAnimation("shoot", "assets/games/player", shoot);
        this.buildAnimation("runShoot", "assets/games/player", runShoot);
        this.buildAnimation("dead", "assets/games/player", dead);
        this.buildAnimation("reborn", "assets/games/player", dead.reverse());
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
        //GUI: read keymask
        var mask = window.cocos.cc.PlayerKeyMask;
        //GUI: for movement, right has priority to left
        if(this.keyMask & mask.right){
            this.velocity.x = this.speed;
            this.setFlippedX(false);
        }
        else if (this.keyMask & mask.left){
            this.velocity.x = -this.speed;
            this.setFlippedX(true);
        }
        else{
            this.velocity.x = 0;
        }

        if(this.keyMask & mask.up){
            if (this.onGround) {
                this.onGround = false;
                this.velocity.y += this.jumpForce;
                this.playAnimation("jump", false);
            }
        }

        if(this.keyMask & mask.fire){
            this.fire(this.keyMask & (mask.left | mask.right));
        }

        this._super(dt);
        this.move(dt);
    },

    onGroundTouched: function(entity){
        //GUI: when it touches the ground, if it's running, restart "run" animation, else "idle" animation
        if(this.velocity.x != 0){
            this.playAnimation("run", true);
        }
        else{
            this.playAnimation("idle", true);
        }
    },

    fire: function(moving){
        //GUI: check if it can fire (canFire flag is to avoid continuos propagation of bullets)
        if(this.onGround && this.weapon) {
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

    onEndFireAction: function(){
        if(this.velocity.x == 0)
            this.playAnimation("idle", true);
        else
            this.playAnimation("run", true);
    },

    ////////////////////////////////////////////////////////////////////
    //GUI: handling life points
    onWeaponHit: function(weapon, damagePoints){
        this._super(weapon, damagePoints);
    },

    onZeroLifePoints: function(){
        //GUI: play fire animation
        this.playAnimation("dead", false, this.onEndDeadAnimation, this);
        this.setTag(window.cocos.cc.kGameEntityDeadPlayerTag);
    },

    onEndDeadAnimation: function(){
        //GUI: broadcast dead event
        var gm = window.cocos.cc.game.gameManager;
        if(gm != null){
            gm.broadcastEvent(window.cocos.cc.GameManagerEvents.kGameManagerEventPlayerDead, this);
        }
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
                    if (this.onGround) {
                        this.playAnimation("run", true);
                    }
                    break;
                case 38:
                    //GUI: Up
                    this.keyMask |= window.cocos.cc.PlayerKeyMask.up;
                    break;
                case 39:
                    //GUI: right
                    this.keyMask |= window.cocos.cc.PlayerKeyMask.right;
                    if (this.onGround) {
                        this.playAnimation("run", true);
                    }
                    break;
                case 40:
                    //GUI: down
                    this.keyMask |= window.cocos.cc.PlayerKeyMask.down;
                    break;
            }
        }
    },

    onKeyReleased: function (key, event) {
        if(this.isAlive()) {
            switch (key) {
                case 32:
                    //GUI: space
                    //this.fire();
                    this.keyMask &= ~window.cocos.cc.PlayerKeyMask.fire;
                    break;
                case 37:
                    this.keyMask &= ~window.cocos.cc.PlayerKeyMask.left;
                    //GUI: if no keys are pressed, and there is no animation, play default (idle) animation
                    if(this.keyMask == 0 && this.onGround) {
                        this.playAnimation("idle", true);
                    }
                    break;
                case 38:
                    //GUI: Up
                    this.keyMask &= ~window.cocos.cc.PlayerKeyMask.up;
                    break;
                case 39:
                    this.keyMask &= ~window.cocos.cc.PlayerKeyMask.right;
                    //GUI: if no keys are pressed, and there is no animation, play default (idle) animation
                    if(this.keyMask == 0 && this.onGround) {
                        this.playAnimation("idle", true);
                    }
                    break;
                case 40:
                    //GUI: down
                    this.keyMask &= ~window.cocos.cc.PlayerKeyMask.down;
                    break;
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
