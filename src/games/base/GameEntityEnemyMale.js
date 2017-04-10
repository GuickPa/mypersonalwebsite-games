/**
 * Created by guglielmo on 09/04/17.
 */
//GUI: Enemy - subclass of enemy
window.cocos.cc.EnemyMale = window.cocos.cc.Enemy.extend({
    _className: "EnemyMale",
    //GUI: custom
    canFire: true,

    ctor: function (fileName, rect, rotated) {
        //GUI: call super
        window.cocos.cc.Enemy.prototype.ctor.call(this, fileName, rect, rotated);
        this.buildAnimations();
    },

    init: function(){
        var self = this;
        window.cocos.cc.Enemy.prototype.init.call(self);
        return true;
    },

    onEnter: function(){
        this._super();
        this.collisionSize = new window.cocos.cc.Size(276, 488);
        this.stateMachine.changeState(window.cocos.cc.kIAStateWalk);
    },

    buildAnimations: function(){
        this.animations = {};
        var idle = ["Idle (1)", "Idle (2)", "Idle (3)", "Idle (4)", "Idle (5)", "Idle (6)", "Idle (7)", "Idle (8)", "Idle (9)", "Idle (10)", "Idle (11)", "Idle (12)", "Idle (12)", "Idle (13)", "Idle (14)", "Idle (15)"];
        var walk = ["Walk (1)", "Walk (2)", "Walk (3)", "Walk (4)", "Walk (5)", "Walk (6)", "Walk (7)", "Walk (8)", "Walk (9)", "Walk (10)"];
        var attack = ["Attack (1)", "Attack (2)", "Attack (3)", "Attack (4)", "Attack (5)", "Attack (6)", "Attack (7)", "Attack (8)"];
        var dead = ["Dead (1)", "Dead (2)", "Dead (3)", "Dead (4)", "Dead (5)", "Dead (6)", "Dead (7)", "Dead (8)", "Dead (9)", "Dead (10)", "Dead (11)", "Dead (12)"];

        this.buildAnimation("idle", "assets/games/enemy/male", idle, 0.08);
        this.buildAnimation("walk", "assets/games/enemy/male", walk);
        this.buildAnimation("attack", "assets/games/enemy/male", attack, 0.05);
        this.buildAnimation("dead", "assets/games/enemy/male", dead);
    },

    update: function (dt) {
        this._super(dt);
    },

    onGroundTouched: function(entity){
        //GUI: when it touches the ground, if it's running, restart "run" animation, else "idle" animation
        if(this.velocity.x != 0){
            this.playAnimation("walk", true);
        }
        else{
            this.playAnimation("idle", true);
        }
    },
});

window.cocos.cc.EnemyMale.create = function (fileName, rect, rotated) {
    return new window.cocos.cc.EnemyMale(fileName, rect, rotated);
};
window.cocos.cc.EnemyMale.createWithTexture = window.cocos.cc.EnemyMale.create;
window.cocos.cc.EnemyMale.createWithSpriteFrameName = window.cocos.cc.EnemyMale.create;
window.cocos.cc.EnemyMale.createWithSpriteFrame = window.cocos.cc.EnemyMale.create;