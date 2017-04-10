/**
 * Created by guglielmo on 05/04/17.
 */
//GUI: Bullet - GameEntity
//GUI: base class - define generic behaviour for bullets - DO NOT make instance of this class
window.cocos.cc.Bullet = window.cocos.cc.GameEntity.extend({
    _className: "Bullet",
    //GUI: custom params
    hitEntity: false,
    shootDirection: window.cocos.cc.p(0,0),
    shouldBeRemoved: false,
    //GUI: max distance
    range: 0,
    currentDistance: 0,

    ctor: function (fileName, rect, rotated) {
        //GUI: call super
        window.cocos.cc.GameEntity.prototype.ctor.call(this, fileName, rect, rotated);
    },

    init: function(){
        var self = this;
        self._super();
        self.gravity = window.cocos.cc.p(0, 0);
        self.hitEntity = false;
        self.shootDirection = window.cocos.cc.p(0,0);
        self.shouldBeRemoved = false;
        self.range = 500;
        self.currentDistance = 0;
        return true;
    },

    setShootDirection: function(direction){
        this.shootDirection = direction;
        if(this.shootDirection == null){
            this.shootDirection = window.cocos.cc.p(0,0);
        }
        else{
            //GUI: get the versor from direction
            var length = Math.sqrt((this.shootDirection.x * this.shootDirection.x) + (this.shootDirection.y * this.shootDirection.y))
            this.shootDirection.x /= length;
            this.shootDirection.y /= length;
        }
        this.velocity.x = this.speed * this.shootDirection.x;
        this.velocity.y = this.speed * this.shootDirection.y;
        //GUI: flip based on direction
        this.setFlippedX(this.velocity.x < 0);
        this.setFlippedY(this.velocity.y < 0);
    },

    update: function (dt) {
        if(this.shouldBeRemoved){
            this.unscheduleUpdate();
            this.removeFromParent();
        }
        else {
            this.move(dt);
            this.currentDistance += dt * this.speed;
            this.shouldBeRemoved = this.currentDistance >= this.range;
        }
    },

    onEnter: function(){
        this._super();
        //GUI: set movement
        this.velocity.x = this.speed * this.shootDirection.x;
        this.velocity.y = this.speed * this.shootDirection.y;
    },

    move: function(dx, dy, dt){
        //GUI: if something was hit, stop moving
        if(!this.hitEntity){
            this._super(dx, dy, dt);
        }
    },

    checkForHitWithEntities: function(tagMask){
        //GUI: if tagMask is null, it makes hit with all the entities
        tagMask = tagMask == null ? tagMask = 0xFFFFFFFF : tagMask;
        //GUI: build this collision rect, based on position and collision rect
        var halfW = this._getWidth() * this.getScaleX() / 2;
        var halfH = this._getHeight() * this.getScaleY() / 2;
        var rect = window.cocos.cc.rect(this.getPosition().x - halfW, this.getPosition().y - halfH, halfW * 2, halfH * 2);
        var scene = window.cocos.cc.director.getRunningScene();
        if (scene) {
            var children = scene.getChildren();
            for (var index = 0; index < children.length; index++) {
                var child = children[index];
                var tag = child.getTag();
                if((tagMask & tag) != 0 && tag != window.cocos.cc.NODE_TAG_INVALID){
                    //GUI: check if collision rect intersects
                    var eHalfW = child._getWidth() * child.getScaleX() / 2;
                    var eHalfH = child._getHeight() * child.getScaleY() / 2;
                    var eRect = window.cocos.cc.rect(child.getPosition().x - eHalfW, child.getPosition().y - eHalfH, eHalfW * 2, eHalfH * 2);
                    if(window.cocos.cc.rectIntersectsRect(rect, eRect)){
                        this.onHitEvent(child);
                        return;
                    }
                }
            }
        }
    },

    onHitEvent: function(entity){
        this._super(entity);
        this.hitEntity = true;
    },

    onEndBlow: function(){
        this.shouldBeRemoved = true;
    },

    moveY: function(dy, dt, p, obstacles, tileSize){
        //GUI: no movement on this axis for now
    }

});

window.cocos.cc.Bullet.create = function (fileName, rect, rotated) {
    return new window.cocos.cc.Bullet(fileName, rect, rotated);
};
window.cocos.cc.Bullet.createWithTexture = window.cocos.cc.Bullet.create;
window.cocos.cc.Bullet.createWithSpriteFrameName = window.cocos.cc.Bullet.create;
window.cocos.cc.Bullet.createWithSpriteFrame = window.cocos.cc.Bullet.create;


//GUI: bullet class definition for player's bullets
window.cocos.cc.RobotBullet = window.cocos.cc.Bullet.extend({
    _className: "RobotBullet",

    ctor: function () {
        //GUI: call super
        window.cocos.cc.Bullet.prototype.ctor.call(this, "assets/games/player/Objects/Bullet_000.png");
        this.speed = 300;
    },

    init: function(){
        this._super();
    },
    
    update: function(dt){
        this._super(dt);
        //GUI: check for hit with enemies
        this.checkForHitWithEntities(window.cocos.cc.kGameEntityEnemyTag);
    },

    onHitEvent: function(entity){        
        //GUI: call super first
        this._super(entity);
        //GUI: play blow animation and set a callback for action after end of explosion
        this.playAnimation("blow", false, function(){this.onEndBlow()});
    },

    onEndBlow: function(){
        this._super();
    },

    onEnter: function(){
        this._super();
        //GUI: set collision size
        this.collisionSize = new window.cocos.cc.Size(160, 32);
        //GUI: init animations
        var idle = ["Bullet_000", "Bullet_001", "Bullet_002", "Bullet_003", "Bullet_004"];
        var blow = ["Muzzle_000", "Muzzle_001", "Muzzle_002", "Muzzle_003", "Muzzle_004"];
        this.buildAnimation("idle", "assets/games/player/Objects", idle, 0.25);
        this.buildAnimation("blow", "assets/games/player/Objects", blow, 0.075);
        this.playAnimation("idle", true);
    },
});

window.cocos.cc.RobotBullet.create = function () {
    return new window.cocos.cc.RobotBullet();
};
window.cocos.cc.RobotBullet.createWithTexture = window.cocos.cc.RobotBullet.create;
window.cocos.cc.RobotBullet.createWithSpriteFrameName = window.cocos.cc.RobotBullet.create;
window.cocos.cc.RobotBullet.createWithSpriteFrame = window.cocos.cc.RobotBullet.create;