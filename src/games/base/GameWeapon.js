/**
 * Created by guglielmo on 10/04/17.
 */
window.cocos.cc.GameWeapon = window.cocos.cc.Class.extend({
    _className: "GameWeapon",
    //GUI: custom
    range: 0,
    //GUI: -1 for infinite ammos or melee weapons
    maxAmmo: -1,
    currentAmmo: -1,
    //GUI: delta time between one shoot and the next one
    fireTime: 500,
    currentDeltaFireTime: 0,
    //GUI: damage points
    power: 1,

    ctor: function(){
        this.init();
    },

    init: function(){

    },

    update: function(dt){
        this.currentDeltaFireTime = Math.min(this.currentDeltaFireTime + dt, this.fireTime);
    },

    canFire: function(){
        return this.currentDeltaFireTime >= this.fireTime;
    },

    //GUI: parent node is the node where add bullets - if null, get current scene from director
    fire: function(position, direction, scale, parentNode){

    },

    getPower: function(){
        return this.power;
    }
});
window.cocos.cc.GameWeapon.create = function(){
    return new window.cocos.cc.GameWeapon();
};

////////////////////////////////////////////////////////////////////////////////////////////////
//GUI: concrete subclass of GameWeapon
window.cocos.cc.RobotLaserGun = window.cocos.cc.GameWeapon.extend({
    _className: "RobotLaserGun",
    //GUI: custom

    ctor: function(){
        this._super();
    },

    init: function(){
        this._super();
        this.range = 500;
        this.maxAmmo = -1;
        this.currentAmmo = - 1;
        this.fireTime = 0.4;
        this.currentDeltaFireTime = this.fireTime;
        this.power = 2;
    },

    fire: function(position, direction, scale, parentNode){
        this._super(position, direction, scale, parentNode);
        if(this.canFire()) {
            var rootNode = (parentNode == null || typeof parentNode === 'undefined') ? window.cocos.cc.director.getRunningScene() : parentNode;
            if (rootNode) {
                var bullet = window.cocos.cc.RobotBullet.create();
                bullet.setPosition(position);
                bullet.setScale(scale);                                
                bullet.setShootDirection(direction);
                rootNode.addChild(bullet, 2);
                //GUI: reset time
                this.currentDeltaFireTime = 0;
            }
        }
    },
});
window.cocos.cc.RobotLaserGun.create = function(){
    return new window.cocos.cc.RobotLaserGun();
};