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
    damagePoints: 0,

    ctor: function (fileName, rect, rotated) {
        //GUI: call super
        this._super(fileName, rect, rotated);
    },

    init: function(){
        var self = this;
        self._super();
        self.gravity = window.cocos.cc.p(0, 0);
        self.hitEntity = false;
        self.shootDirection = window.cocos.cc.p(0,0);
        self.shouldBeRemoved = false;
        self.range = 256 * 4;
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
        //GUI: actually should be rotated, not flipped!
        this.setFlippedY(this.velocity.y < 0);
    },
    
    setDamagePoints: function(damagePoints){
        this.damagePoints = damagePoints;
    },
    
    getDamagePoints: function(){
        return this.damagePoints;
    },

    //GUI: override: do no checks for tiles
    checkTile: function(tile){
        return false;
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

    moveY: function(dy, dt, p, obstacles, tileSize){
        //GUI: no movement on this axis for now
    },

    checkForHitWithEntities: function(tagMask){
        //GUI: if tagMask is null, it makes hit with all the entities
        tagMask = tagMask == null ? tagMask = 0xFFFFFFFF : tagMask;
        //GUI: build this collision rect, based on position and collision rect
        var halfW = this.collisionSize.width * this.getScaleX() / 2;
        var halfH = this.collisionSize.height * this.getScaleY() / 2;
        var rect = window.cocos.cc.rect(this.getPosition().x - halfW, this.getPosition().y - halfH, halfW * 2, halfH * 2);
        var scene = window.cocos.cc.director.getRunningScene();
        if (scene) {
            var children = scene.getChildren();
            var targetList = scene.getChildrenByTagMask(tagMask, true);
            if(targetList && targetList.length > 0){
                for (var index = 0; index < targetList.length; index++){
                    var child = targetList[index];
                    var eWidth = child.collisionSize != null ? child.collisionSize.width : child._getWidth();
                    var eHeight = child.collisionSize != null ? child.collisionSize.height : child._getHeight();
                    //GUI: check if collision rect intersects
                    var eHalfW = eWidth * child.getScaleX() / 2;
                    var eHalfH = eHeight * child.getScaleY() / 2;
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
        if(entity != null){
            // if(entity.onHitEvent != null){
            //     entity.onHitEvent(this);
            // }
            if(entity.onWeaponHit != null){
                entity.onWeaponHit(this, this.getDamagePoints())
            }
        }
        this.hitEntity = true;
    },

    onEndBlow: function(){
        this.shouldBeRemoved = true;
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
        this._super("assets/games/player/Objects/Bullet_000.png");
        this.speed = 256 * 3.5;
    },

    init: function(){
        this._super();
    },
    
    update: function(dt){
        this._super(dt);
        //GUI: check for hit with enemies
        if(!this.hitEntity) {
            this.checkForHitWithEntities(window.cocos.cc.kGameEntityEnemyTag);
        }
    },

    moveX: function(dx, dy, dt, p, obstacles, tileSize){
        //GUI: getting tileset lines which this.bb intersect with (opposite axis)
        var max = obstacles.getLayerSize().height -1;
        var minY = Math.max(0, Math.floor(p.y/ tileSize.height)); //GUI: todo: consider using Math.round
        var colX = Math.round(p.x / tileSize.width);
        //GUI: scan along these rows and towards the direction to find obstacles
        //then find the distance with the closest one: movement is the minimum between distance and this'step
        //GUI: scroll rows
        var colMax = Math.min(obstacles.getLayerSize().width - 1, colX);
        if (dx > 0) {
            //GUI: getting forward face x-value
            var fx = p.x + ((this.collisionSize.width / 2) * this.getScaleX());
            var min = 100000.0;
            //GUI: scroll cols
            for (var col = colX; col <= colMax; col++) {
                var tp = window.cocos.cc.p(col, max - minY)
                var tile = obstacles.getTileAt(tp);
                if (tile) {
                    //GUI: get tile's properties
                    var gid = obstacles.getTileGIDAt(tp);
                    var properties = this.sceneTilemap.getPropertiesForGID(gid);
                    //GUI: check for slopes
                    if(properties != null && properties["sr"] != null && properties["sl"] != null){
                        //GUI: calc left and right of tile
                        var tileL = tile.getPosition().x * this.sceneTilemap.getScaleX();
                        var tileW = tile._getWidth() * this.sceneTilemap.getScaleX();
                        //GUI: calc difference between position and this'position.x
                        var dsy = (this.getPosition().x - tileL) / tileW;
                        if(0 <= dsy && dsy <= 1) {
                            var sl = parseFloat(properties["sl"]);
                            var bottomY = this.getPosition().y ;
                            var slopeY = (tile.getPosition().y + (tile._getHeight() * sl)) * this.sceneTilemap.getScaleY();
                            //GUI: if slope is less than bottom of this, or is behind, go on
                            if (bottomY >= slopeY || this.getPosition().x >= (tile.getPosition().x * this.sceneTilemap.getScaleX())) {
                                min = dx;
                                this.setPositionX(p.x + min);
                                return;
                            }
                            else {
                                //GUI: if going right, distance is with tile' x pos and this'front face
                                var dist = ((tile.getPosition().x - 1) * this.sceneTilemap.getScaleX()) - fx;
                                min = Math.min(Math.max(0, dist), min);
                            }
                        }
                    }
                    else {
                        //GUI: if going right, distance is with tile' x pos and this'front face
                        var dist = ((tile.getPosition().x - 1) * this.sceneTilemap.getScaleX()) - fx;
                        min = Math.min(Math.max(0, dist), min);
                    }
                }
            }

            var step = Math.min(min, dx);
            this.setPositionX(p.x + step);
            if(min <= dx){
                this.onHitEvent();
            }
            return;
        }
        else if(dx < 0){
            //GUI: getting forward face x-value
            var fx = p.x - ((this.collisionSize.width / 2) * this.getScaleX());
            var min = -100000.0;
            //GUI: scroll rows
            var colMin = Math.max(0, colX);
            for (var col = colX; col <= colMax; col++) {
                var tp = window.cocos.cc.p(col, max - minY);
                var tile = obstacles.getTileAt(tp);
                if (tile) {
                    //GUI: get tile's properties
                    var gid = obstacles.getTileGIDAt(tp);
                    var properties = this.sceneTilemap.getPropertiesForGID(gid);
                    //GUI: check for slopes
                    if(properties != null && properties["sr"] != null && properties["sl"] != null){
                        //GUI: calc left and right of tile
                        var tileL = tile.getPosition().x * this.sceneTilemap.getScaleX();
                        var tileW = tileSize.width;
                        //GUI: calc difference between position and this'position.x
                        var dsy = (this.getPosition().x - tileL) / tileW;
                        if(0 <= dsy && dsy <= 1) {
                            var sr = parseFloat(properties["sr"]);
                            var bottomY = this.getPosition().y;
                            var slopeY = (tile.getPosition().y + (tile._getHeight() * sr)) * this.sceneTilemap.getScaleY();
                            //GUI: if slope is less than bottom of this, or is behind, go on
                            if (bottomY >= slopeY || this.getPosition().x <= ((tile.getPosition().x * this.sceneTilemap.getScaleX()) + tileSize.width)) {
                                this.setPositionX(p.x + Math.max(min, dx));
                                return;
                            }
                            else {
                                //GUI: if going left, distance is with tile' x pos + tile's width and this'back face
                                var dist = (((tile.getPosition().x + 1) * this.sceneTilemap.getScaleX()) + tileSize.width) - fx;//GUI: size already scaled
                                min = Math.max(Math.min(0, dist), min);
                            }
                        }
                    }
                    else {
                        //GUI: if going left, distance is with tile' x pos + tile's width and this'back face
                        var dist = (((tile.getPosition().x + 1) * this.sceneTilemap.getScaleX()) + tileSize.width) - fx;//GUI: size already scaled
                        min = Math.max(Math.min(0, dist), min);
                    }
                }

            }
            var step = Math.max(min, dx);
            this.setPositionX(p.x + step);
            if(min >= dx){
                this.onHitEvent();
            }
            return;
        }
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
        this.collisionSize = new window.cocos.cc.Size(120, 82);
        //GUI: init animations
        var idle = ["Bullet_000", "Bullet_001", "Bullet_002", "Bullet_003", "Bullet_004"];
        var blow = ["Muzzle_000", "Muzzle_001", "Muzzle_002", "Muzzle_003", "Muzzle_004"];
        this.buildAnimation("idle", "assets/games/player/Objects", idle, 0.075);
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