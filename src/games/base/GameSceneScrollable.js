/**
 * Created by guglielmo on 06/04/17.
 */
window.cocos.cc.GameSceneScrollable = window.cocos.cc.GameScene.extend({
    nodeToFollow: null,
    leftBound: 0,
    rightBound: 0,
    scrollSpeed: 0,

    ctor:function () {
        window.cocos.cc.GameScene.prototype.ctor.call(this);
        this.init();
    },
    
    init: function(){
        this.nodeToFollow = null;
        this.leftBound = 0;
        this.rightBound = 0;
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
                this.scrollSpeed = 100;
            }
            this.scheduleUpdate();
        }
    },

    update: function (dt) {
        //GUI: scroll itself to follow the target node
        if(this.nodeToFollow){
            var nx = this.nodeToFollow.getPosition().x + this.getPosition().x;
            //GUI: if node is beyond a boundary, scrolls
            if(nx < this.leftBound){
                this.setPositionX(Math.min(0, this.getPositionX() + (this.scrollSpeed * dt)));
            }
            else if (nx > this.rightBound){
                this.setPositionX(this.getPositionX() - (this.scrollSpeed * dt));
            }
        }
    }
});