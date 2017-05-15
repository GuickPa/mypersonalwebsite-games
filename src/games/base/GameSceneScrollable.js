/**
 * Created by guglielmo on 06/04/17.
 */
window.cocos.cc.GameSceneScrollable = window.cocos.cc.GameScene.extend({
    nodeToFollow: null,
    leftBound: 0,
    rightBound: 0,
    scrollSpeed: 0,
    velocity: null,

    ctor:function () {
        this._super();
        this.init();
    },
    
    init: function(){
        this.nodeToFollow = null;
        this.leftBound = 0;
        this.rightBound = 0;
        this.velocity = window.cocos.cc.p(0,0);
    },

    setNodeToFollow: function(node, scrollSpeed){
        if(this.nodeToFollow){
            this.unscheduleUpdate();
        }

        this.nodeToFollow = node;
        if(this.nodeToFollow){
            if(typeof  scrollSpeed === 'number'){
                this.scrollSpeed = scrollSpeed;
            }else{
                this.scrollSpeed = 200;
            }
            this.scheduleUpdate();
            // var moveTo = window.cocos.cc.MoveTo.create(100, -4000, 0);
            // this.runAction(moveTo);
        }
    },

    update: function (dt) {
        //GUI: scroll itself to follow the target node
        if(this.nodeToFollow){
            var x = this.nodeToFollow.getPosition().x * (this.tilemap != null ? this.tilemap.getScaleX() : 1)
            var nx = x + this.getPosition().x;
            //GUI: if node is beyond a boundary, scrolls
            if(nx < this.leftBound){
                this.velocity.x = this.scrollSpeed;
                //this.setPositionX(Math.min(0, this.getPositionX() + (this.scrollSpeed * dt)));
            }
            else if (nx > this.rightBound){
                this.velocity.x = -this.scrollSpeed;
                //this.setPositionX(this.getPositionX() - (this.scrollSpeed * dt));
            }
        }
        //GUI: update position
        this.setPositionX(this.getPositionX() + (this.velocity.x * dt));
        //GUI: deceleration
        var dx = -this.velocity.x * dt;
        if(this.velocity.x > 0){
            this.velocity.x = Math.max(0, this.velocity.x + dx);
            this.setPositionX(Math.min(0, this.getPositionX()));
        }
        else if(this.velocity.x < 0){
            this.velocity.x = Math.min(0, this.velocity.x + dx);
            this.setPositionX(Math.max(window.cocos.cc.director.getWinSize().width - this.totalSize.width, this.getPositionX()));
        }

        //GUI: avoids little flickerings
        if(Math.abs(this.velocity.x) < 1){
            this.velocity.x = 0;
        }
    }
});