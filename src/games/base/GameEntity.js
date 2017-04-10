/**
 * Created by guglielmo on 29/03/17.
 */
window.cocos.cc.kGameEntityPlayerTag = 0x100;
window.cocos.cc.kGameEntityEnemyTag = 0x1000;

//GUI: GameEntity is the base entity for all the games
window.cocos.cc.GameEntity = window.cocos.cc.Sprite.extend({
    _className: "GameEntity",
    //GUI: custom members
    //GUI: collection of animations
    animations : {},
    //GUI: hold reference to current animation (if any)
    currentAnimationAction: null,
    //GUI: for movements
    //GUI: custom members
    speed: 70.0,
    jumpForce: 300.0,
    onGround: true,
    //GUI: for movement and gravity simulation
    collisionSize: null,
    velocity: window.cocos.cc.p(0,0),
    gravity: window.cocos.cc.p(0, -10),
    //GUI: reference to tilemap for obstacles
    sceneTilemap: null,
    //GUI: weapon
    weapon: null,

    ctor: function (fileName, rect, rotated) {
        var self = this;
        //GUI: call super
        self._super(fileName, rect, rotated);
        //GUI: need to set value to all the members because instances will ends up to share prototype object until a new value is setted.
        // after a new value is setted, member is copied into object instance -> http://discuss.cocos2d-x.org/t/cc-class-multiple-instance-problem-cocos2d-js-3-2/19853/5
        self.init();
    },
    
    init: function(){
        var self = this;
        window.cocos.cc.Sprite.prototype.init.call(self);
        //GUI: need to set value to all the members because instances will ends up to share prototype object until a new value is setted.
        // after a new value is setted, member is copied into object instance -> http://discuss.cocos2d-x.org/t/cc-class-multiple-instance-problem-cocos2d-js-3-2/19853/5
        self.animations = {};
        self.currentAnimationAction = null;
        self.speed = 70.0;
        self.jumpForce = 300.0;
        self.onGround = true;
        self.collisionSize = new window.cocos.cc.Size(self._getWidth(), self._getHeight());
        self.velocity = window.cocos.cc.p(0,0);
        self.gravity = window.cocos.cc.p(0,-10);
        //GUI: set tilemap
        var scene = window.cocos.cc.director.getRunningScene();
        if(scene){
            this.sceneTilemap = scene.tilemap;
        }
        return true;
    },
    
    onEnter: function(){
        this._super();
        this.collisionSize = new window.cocos.cc.Size(this._getWidth(), this._getHeight());
        this.scheduleUpdate();
    },

    setScale: function (scale, scaleY){
        //GUI: call super
        this._super(scale, scaleY);
    },

    buildAnimation: function(name, basePath, frames, timePerFrame){

        var spriteFrames = [];
        for(var i = 0; i < frames.length; i++) {
            var texture = window.cocos.cc.textureCache.addImage(basePath + "/"  + frames[i] + ".png");
            var frame = new window.cocos.cc.SpriteFrame(texture, window.cocos.cc.rect(0,0,texture._getWidth(),texture._getHeight()));
            spriteFrames.push(frame);
        }
        var animation = new window.cocos.cc.Animation(spriteFrames, timePerFrame ? timePerFrame : 0.1);
        this.animations[name] = animation;        
    },
        
    //GUI: endCallback works only if not in loop
    playAnimation : function(name, loop, endCallback, caller){
        //GUI: safe check
        if(typeof endCallback === 'undefined'){
            endCallback = null;
        }
        //GUI: play animation
        var cc = window.cocos.cc;
        if(this.animations !== 'undefined' && this.animations[name] !== 'undefined') {
            //GUI: get animation from list and create an action
            var action = cc.animate(this.animations[name]);
            if(loop) {
                action.repeatForever();
            }
            else if (endCallback != null){
                //GUI: if there is a callback, create a sequence with action and adding function action with the callback
                action = cc.sequence(action, cc.callFunc(endCallback, caller ? caller : this));
            }
            //GUI: stop previous animation (also prevents an existing callback to be called)
            this.stopCurrentAnimation();

            //GUI: save reference to last action
            this.currentAnimationAction = action;
            //GUI: run animate
            this.runAction(this.currentAnimationAction);
        }
    },
    
    stopCurrentAnimation: function(){
        if(this.currentAnimationAction != null){
            this.stopAction(this.currentAnimationAction);
        }  
    },
    
    update: function(dt){
        this._super(dt);
        if(this.weapon){
            this.weapon.update(dt);
        }
    },

    move: function(dt){
        this.velocity.x += this.gravity.x;
        this.velocity.y += this.gravity.y;
        var dx = this.velocity.x * dt;
        var dy = this.velocity.y * dt;
        var p = this.getPosition();
        //this.setPosition(p.x + dx, p.y + dy);
        if(this.sceneTilemap != null){
            //GUI: get tile'size multiplied for tileMap scaling
            var size = this.sceneTilemap.getTileSize();
            var sf = this.sceneTilemap.getScale();
            size.width *= sf;
            size.height *= sf;
            //GUI: check with obstacles
            var obstacles = this.sceneTilemap.getLayer('obstacle');
            if(obstacles) {
                this.moveX(dx, dt, p, obstacles, size);
                p = this.getPosition();
                this.moveY(dy, dt, p, obstacles, size);
                //p = this.getPosition();
                //this.moveSlope(dx, p, obstacles, size)

            }
            //GUI: no obstacles: just move
            else{
                this.setPosition(p.x + dx, p.y + dy);
            }
        }
        //GUI: no tiles: just move
        else{
            this.setPosition(p.x + dx, p.y + dy);
        }
    },

    moveX: function(dx, dt, p, obstacles, tileSize){
        //GUI: getting tileset lines which this.bb intersect with (opposite axis)
        var halfH = (this.collisionSize.height / 2 * this.getScaleY());
        var max = obstacles.getLayerSize().height -1;
        var minY = Math.max(0,Math.floor((p.y - halfH) / tileSize.height)); //GUI: todo: consider using Math.round
        var maxY = Math.min(max - 1, Math.floor((p.y + halfH) / tileSize.height)); //GUI: todo: consider using Math.round
        var colX = Math.floor(p.x / tileSize.width);
        //GUI: scan along these rows and towards the direction to find obstacles
        //then find the distance with the closest one: movement is the minimum between distance and this'step
        if (dx > 0) {
            //GUI: getting forward face x-value
            var fx = p.x + ((this.collisionSize.width / 2) * this.getScaleX());
            var min = 100000.0;
            //GUI: scroll rows
            var colMax = Math.min(obstacles.getLayerSize().width - 1, colX + (halfH/tileSize.width));
            for (var i = Math.min(max, max - minY); i >= Math.max(0,max - maxY); i--) {
                //GUI: scroll cols
                for (var col = colX; col <= colMax; col++) {
                    var tp = window.cocos.cc.p(col, i)
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
                                var bottomY = this.getPosition().y + 1 - halfH;
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
            var fx = p.x + 1 - ((this.collisionSize.width / 2) * this.getScaleX());
            var min = -100000.0;
            //GUI: scroll rows
            var colMin = Math.max(0, colX - (halfH/tileSize.width));
            for (var i = Math.min(max, max - minY); i >= Math.max(0,max - maxY); i--) {
                for (var col = colX; col >= colMin; col--) {
                    var tp = window.cocos.cc.p(col, i)
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
                                var bottomY = this.getPosition().y  - halfH;
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
            }
            var step = Math.max(min, dx);
            this.setPositionX(p.x + step);
            if(min >= dx){
                this.onHitEvent();
            }
            return;
        }
    },

    moveY: function(dy, dt, p, obstacles, tileSize){
        //GUI: getting tileset lines which this.bb intersect with (opposite axis)
        var halfW = (this.collisionSize.width / 2 * Math.abs(this.getScaleX()));
        var minX = Math.floor((p.x - halfW) / tileSize.width); //GUI: todo: consider using Math.round
        var maxX = Math.floor((p.x + halfW) / tileSize.width); //GUI: todo: consider using Math.round
        var rowY = Math.floor(p.y / tileSize.height);
        var max = obstacles.getLayerSize().height - 1;
        //GUI: scan along these rows and towards the direction to find obstacles
        //then find the distance with the closest one: movement is the minimum between distance and this'step
        if (dy > 0) {
            //GUI: getting upper face y-value
            var fy = p.y + (this.collisionSize.height / 2 * this.getScaleY());
            for (var i = minX; i <= maxX; i++) {
                for (var row = max - rowY; row >= 0; row--) {
                    var tile = obstacles.getTileAt(window.cocos.cc.p(i, row));
                    if (tile) {
                        //GUI: if going up, distance is with tile'y pos and this'upper face
                        var dist = ((tile.getPosition().y - 1) * this.sceneTilemap.getScaleY()) - fy;
                        if(dist >= 0) {
                            var step = Math.min(dist, dy);
                            this.setPositionY(p.y + step);
                            return;
                        }
                    }
                }
            }
            //GUI: default behaviour
            console.log("default");
            this.setPositionY(p.y + dy);
            return;
        }
        else if(dy < 0){
            //GUI: getting bottom face y-value
            var halfH = (this.collisionSize.height / 2) * this.getScaleY();
            var fy = p.y - halfH;
            var min = -100000.0;
            for (var i = minX; i <= maxX; i++) {
                for (var row = max - rowY; row <= max; row++) {
                    var tp = window.cocos.cc.p(i, row);
                    var tile = obstacles.getTileAt(tp);
                    if (tile) {
                        //GUI: get tile's properties
                        var gid = obstacles.getTileGIDAt(tp);
                        var properties = this.sceneTilemap.getPropertiesForGID(gid);
                        var tileY = tile.getPosition().y * this.sceneTilemap.getScaleY();
                        if(properties != null && (properties["sl"] != null || properties["sr"] != null)){
                            var sr = parseFloat(properties["sr"]);
                            var sl = parseFloat(properties["sl"]);
                            //GUI: calc left and right of tile
                            var tileL = tile.getPosition().x * this.sceneTilemap.getScaleX();
                            var tileW = tileSize.width;
                            //GUI: calc difference between position and this'position.x
                            var dsy = (this.getPosition().x - tileL) / tileW;
                            if (0 <= dsy && dsy <= 1) {
                                var tileH = tileSize.height;
                                var leftFloorY = tileH * sl;
                                var rightFloorY = tileH * sr;
                                var floorY = ((1 - dsy) * leftFloorY + dsy * rightFloorY);
                                //GUI: this is the position on slope - calc difference
                                var y = tileY + floorY + 1;
                                var dist = y - fy;
                                min = dist;
                                //GUI: if it is on slope, it is on ground
                                if(dist >= dy) {
                                    this.velocity.y = 0;
                                    //GUI: triggers event, if previously wasn't on the ground
                                    if(!this.onGround){
                                        this.onGroundTouched(tile);
                                        this.onHitEvent(tile);
                                    }
                                    this.onGround = true;
                                    this.setPositionY(y +  halfH);
                                }
                                else{
                                    this.setPositionY(p.y + dy);
                                }

                                return;
                            }
                        }
                        else {
                            //GUI: if going down, distance is with tile'y pos + tile's height and this'bottom face
                            var dist = (((tile.getPosition().y + 1) * this.sceneTilemap.getScaleY()) + tileSize.height) - fy;//GUI: size already scaled
                            min = Math.max(Math.min(0, dist), min);
                            //GUI: if goind down, it is not on ground
                            //this.onGround = false;
                            break;
                        }
                    }
                    else{
                        //GUI: no obstacle down: no on the ground
                        //this.onGround = false;
                    }
                }
            }

            var step = Math.max(min, dy);
            if(step >= 0){
                this.velocity.y = 0;
                //GUI: triggers event, if previously wasn't on the ground
                if(!this.onGround){
                    this.onGroundTouched(tile);
                    this.onHitEvent(tile);
                }
                this.onGround = true;
            }
            this.setPositionY(p.y + step);
            return;
        }
    },

    ////////////////////////////////////////////////////////////////////
    //GUI: events on movements
    onGroundTouched: function(entity){
        
    },
    
    onHitEvent: function(entity){

    },

    ////////////////////////////////////////////////////////////////////
    //GUI: handling keyboard events
    registerForKeyboardEvents: function(){        
        if ('keyboard' in window.cocos.cc.sys.capabilities) {
            //GUI: reference for listener
            var self = this;
            //GUI: build listener
            window.cocos.cc.eventManager.addListener({
                event: window.cocos.cc.EventListener.KEYBOARD,
                gameEntity:self, //GUI: give a reference to gameEntity
                keyboardCallbacks: {
                    keyPressureMap: {}, //GUI: keep a counter for each button pressed
                },
                onKeyPressed: function (key, event) {
                    //GUI: check if key was pressed and not holding (counter == 0 or null)
                    var counter = this.keyboardCallbacks.keyPressureMap[key];
                    if(typeof(counter) === 'undefined' || counter == 0){
                        this.keyboardCallbacks.keyPressureMap[key] = 1;
                        if(this.gameEntity.onKeyPressed != null){
                            this.gameEntity.onKeyPressed(key,event);
                        }
                    }else{
                        this.keyboardCallbacks.keyPressureMap[key]++
                        if(this.gameEntity.onKeyHold != null){
                            this.gameEntity.onKeyHold(key,event);
                        }
                    }
                },
                onKeyReleased: function (key, event) {
                    var counter = this.keyboardCallbacks.keyPressureMap[key];
                    if(typeof(counter) !== 'undefined')
                        this.keyboardCallbacks.keyPressureMap[key] = 0;
                    this.gameEntity.onKeyReleased(key, event);
                }
            }, this);
            return true;
        }
    },
    
    onKeyPressed: function (key, event) {

    },

    onKeyHold: function (key, event) {

    },

    onKeyReleased: function (key, event) {

    },

    ////////////////////////////////////////////////////////////////////
    //GUI: handling mouse events
    onMouseDown: function (event) {

    },
    onMouseUp: function (event) {
        
    },

    onMouseMove: function(event){

    },

    onMouseScroll: function(event){
        
    }

});

window.cocos.cc.GameEntity.create = function (fileName, rect, rotated) {
    return new window.cocos.cc.GameEntity(fileName, rect, rotated);
};
window.cocos.cc.GameEntity.createWithTexture = window.cocos.cc.GameEntity.create;
window.cocos.cc.GameEntity.createWithSpriteFrameName = window.cocos.cc.GameEntity.create;
window.cocos.cc.GameEntity.createWithSpriteFrame = window.cocos.cc.GameEntity.create;