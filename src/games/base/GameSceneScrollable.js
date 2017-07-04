/**
 * Created by guglielmo on 06/04/17.
 */
window.cocos.cc.GameSceneScrollable = window.cocos.cc.GameScene.extend({
    nodeToFollow: null,
    leftBound: 0,
    rightBound: 0,
    scrollSpeed: 0,
    velocity: null,
    moveAction: null,

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

    onExit: function(){
        this._super();
        this.nodeToFollow = null;
        if(this.tilemap != null){
            this.tilemap.stopAllActions();
        }
        this.moveAction = null;
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
        if(this.nodeToFollow && this.tilemap){
            var x = this.nodeToFollow.getPosition().x;// * (this.tilemap != null ? this.tilemap.getScaleX() : 1)
            var nx = x + this.tilemap.getPosition().x;
            //GUI: if node is beyond a boundary, scrolls
            if(nx < this.leftBound){
                //this.velocity.x = this.scrollSpeed;
                //this.setPositionX(Math.min(0, this.getPositionX() + (this.scrollSpeed * dt)));
                console.log("left")
                if(this.moveAction == null && this.tilemap.getPositionX() < 0) {
                    this.moveAction = window.cocos.cc.repeatForever(window.cocos.cc.moveBy(1, this.scrollSpeed, 0));
                    this.tilemap.runAction(this.moveAction);
                }
            }
            else if (nx > this.rightBound){
                //this.velocity.x = -this.scrollSpeed;
                //this.setPositionX(this.getPositionX() - (this.scrollSpeed * dt));
                console.log("right")
                if(this.moveAction == null) {
                    this.moveAction = window.cocos.cc.repeatForever(window.cocos.cc.moveBy(1, -this.scrollSpeed, 0));
                    this.tilemap.runAction(this.moveAction);
                }
            }
            else if(this.moveAction != null){
                this.tilemap.stopAction(this.moveAction);
                this.moveAction = null;
            }
        }
    }
});