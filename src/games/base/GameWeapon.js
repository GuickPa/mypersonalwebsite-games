/**
 * Created by guglielmo on 10/04/17.
 */
window.cocos.cc.GameWeapon = window.cocos.cc.Class.extend({
    _className: "GameWeapon",
    //GUI: custom
    entity: null, //GUI: owner of this weapon
    enemyTag: 0, //GUI: tag mask for looking for enemies
    range: 0,
    //GUI: -1 for infinite ammos or melee weapons
    maxAmmo: -1,
    currentAmmo: -1,
    //GUI: delta time between one shoot and the next one
    fireTime: 500,
    currentDeltaFireTime: 0,
    //GUI: damage points
    damagePoints: 1,

    ctor: function(entity, enemyTag){
        this.init(entity, enemyTag);
    },

    init: function(entity, enemyTag){
        this.entity = entity;
        this.enemyTag = enemyTag;
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

    //GUI: return a list of all the entities with a specified tag which distance is less or equal to this.range
    getEnemiesInRange: function(){
        if(this.entity != null) {
            var scene = window.cocos.cc.director.getRunningScene();
            if (scene) {
                var children = scene.getChildren();
                var list = [];
                for (var index = 0; index < children.length; index++) {
                    var child = children[index];
                    if (child.getTag() & this.enemyTag) {
                        //GUI: one direction weapon: look only for enemies in front of this.entity
                        if(this.entity.isFlippedX()){
                            //GUI: if flipped, this.entity is looking to the left. Looking for entities with position.x less or equal to this.entity.getPositionX
                            if(this.entity.getPositionX() >= child.getPositionX()){
                                var dist = this.calcDistanceWithEntity(child);
                                if(dist <= this.range){
                                    list.push(child);
                                }
                            }
                        }
                        else{
                            //GUI: if flipped, this.entity is looking to the right. Looking for entities with position.x bigger or equal to this.entity.getPositionX
                            if(this.entity.getPositionX() <= child.getPositionX()){
                                var dist = this.calcDistanceWithEntity(child);
                                if(dist <= this.range){
                                    list.push(child);
                                }
                            }
                        }
                    }
                }

                return list;
            }
        }

        return null;
    },

    calcDistanceWithEntity: function(entity){
        if(entity && this.entity) {
            //GUI: calc the distance vector between entity owner of thi state and founded enemy node
            var dv = window.cocos.cc.p(entity.getPosition().x - this.entity.getPosition().x, entity.getPosition().y - this.entity.getPosition().y);
            var dist = Math.sqrt((dv.x * dv.x) + (dv.y * dv.y));
            return dist;
        }
        //GUI: invalid value: distance is always positive
        return -1
    },

    getDamagePoints: function(){
        return this.damagePoints;
    }
});
window.cocos.cc.GameWeapon.create = function(entity, enemyTag){
    return new window.cocos.cc.GameWeapon(entity, enemyTag);
};

////////////////////////////////////////////////////////////////////////////////////////////////
//GUI: concrete subclasses of GameWeapon
window.cocos.cc.RobotLaserGun = window.cocos.cc.GameWeapon.extend({
    _className: "RobotLaserGun",
    //GUI: custom

    ctor: function(entity, enemyTag){
        this._super(entity, enemyTag);
    },

    init: function(entity, enemyTag){
        this._super(entity, enemyTag);
        this.range = 500;
        this.maxAmmo = -1;
        this.currentAmmo = - 1;
        this.fireTime = 0.4;
        this.currentDeltaFireTime = this.fireTime;
        this.damagePoints = 2;
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
                bullet.setDamagePoints(this.getDamagePoints());
                rootNode.addChild(bullet, 2);
                //GUI: reset time
                this.currentDeltaFireTime = 0;
            }
        }
    },
});
window.cocos.cc.RobotLaserGun.create = function(entity){
    return new window.cocos.cc.RobotLaserGun(entity);
};

window.cocos.cc.ZombieClaw = window.cocos.cc.GameWeapon.extend({
    _className: "ZombieClaw",
    //GUI: custom

    ctor: function(entity, enemyTag){
        this._super(entity, enemyTag);
    },

    init: function(entity, enemyTag){
        this._super(entity, enemyTag);
        this.range = 40;
        this.maxAmmo = -1;
        this.currentAmmo = - 1;
        this.fireTime = 0.6;
        this.currentDeltaFireTime = this.fireTime;
        this.damagePoints = 1;
    },

    fire: function(position, direction, scale, parentNode){
        this._super(position, direction, scale, parentNode);
        if(this.canFire()) {
            //GUI: get enemies in range
            var list = this.getEnemiesInRange();
            if(list != null){
                for(var i = 0; i < list.length; i++){
                    var entity = list[i];
                    if(entity.onWeaponHit != null){
                        entity.onWeaponHit(this, this.getDamagePoints())
                    }
                }
            }
        }
    },
});
window.cocos.cc.ZombieClaw.create = function(entity, enemyTag){
    return new window.cocos.cc.ZombieClaw(entity, enemyTag);
};