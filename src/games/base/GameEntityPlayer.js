/**
 * Created by guglielmo on 29/03/17.
 */
//GUI: Player - GameEntity
window.cocos.cc.Player = window.cocos.cc.GameEntity.extend({
    _className: "Player",

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
        return true;
    },

    onEnter: function(){
        this._super();
        this.collisionSize = new window.cocos.cc.Size(276, 488);
        this.playAnimation("idle", true);

        //GUI: ask to current scene to set its start position (need to be done here, after player was loaded)
        var scene = window.cocos.cc.director.getRunningScene();
        if(scene != null){
            if(typeof scene.setPlayerStartPosition != 'undefined'){
                scene.setPlayerStartPosition(this);
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

    fire: function(){
        //GUI: check if it can fire (canFire flag is to avoid continuos propagation of bullets)
        if(this.onGround && this.weapon) {
            if(this.weapon.canFire()) {
                //GUI: make the weapon to fire
                var direction = window.cocos.cc.p(this.isFlippedX() ? -1 : 1, 0);
                this.weapon.fire(this.getPosition(), direction, this.getScale());
                //GUI: play fire animation
                this.playAnimation("shoot", false, this.onEndFireAction, this);
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

    ////////////////////////////////////////////////////////////////////
    //GUI: handling keyboard events
    onKeyPressed: function (key, event) {
        if(this.isAlive()) {
            switch (key) {
                case 32:
                    //GUI: space
                    this.fire();
                    break;
                case 37:
                    //GUI: left
                    this.velocity.x = -this.speed;
                    this.setFlippedX(true);
                    if (this.onGround) {
                        this.playAnimation("run", true);

                    }
                    break;
                case 38:
                    //GUI: Up
                    if (this.onGround) {
                        this.onGround = false;
                        this.velocity.y += this.jumpForce;
                        this.playAnimation("jump", false);
                    }
                    break;
                case 39:
                    //GUI: right
                    this.velocity.x = this.speed;
                    this.setFlippedX(false);
                    if (this.onGround) {
                        this.playAnimation("run", true);
                    }
                    break;
            }
        }
    },

    onKeyReleased: function (key, event) {
        if(this.isAlive()) {
            switch (key) {
                case 37:
                    this.velocity.x = 0;
                    if (this.onGround) {
                        this.playAnimation("idle", true);
                    }
                    break;
                case 39:
                    this.velocity.x = 0;
                    if (this.onGround) {
                        this.playAnimation("idle", true);
                    }
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
