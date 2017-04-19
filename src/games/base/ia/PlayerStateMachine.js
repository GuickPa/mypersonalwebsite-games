/**
 * Created by guglielmo on 19/04/17.
 */
window.cocos.cc.PlayerStateMachine = window.cocos.cc.IAStateMachine.extend({
    _className: "PlayerStateMachine",
    //GUI: custom
    ctor: function(entity){

        this.entity = entity;
        this.init();
    },

    initStates: function(){
        this._super();
        this.states[window.cocos.cc.kIAStateIdle] = window.cocos.cc.PlayerStateIdle.create();
        this.states[window.cocos.cc.kIAStateRun] = window.cocos.cc.PlayerStateRun.create();
        this.states[window.cocos.cc.kIAStateJump] = window.cocos.cc.PlayerStateJump.create();
        this.states[window.cocos.cc.kIAStateSlide] = window.cocos.cc.PlayerStateSlide.create();
        // this.states[window.cocos.cc.kIAStateDeath] = window.cocos.cc.IAStateDeath.create();
        // this.states[window.cocos.cc.kIAStateDead] = window.cocos.cc.IAStateDead.create();
        // this.states[window.cocos.cc.kIAStateReborn] = window.cocos.cc.IAStateReborn.create();
        //GUI: set entity to states
        for(var key in this.states){
            this.states[key].setEntity(this.entity);
        }
    },

    inputUpdate: function(value){
        if(this.currentState != null){
            this.currentState.inputUpdate(value);
        }
    },

    onKeyPressed: function(event,button,mask){
        if(this.currentState != null){
            this.currentState.onKeyPressed(event, button, mask);
        }
    },

    onKeyReleased: function(event,button,mask){
        if(this.currentState != null){
            this.currentState.onKeyReleased(event, button, mask);
        }
    }
});

window.cocos.cc.PlayerStateMachine.create = function(entity){
    return new window.cocos.cc.PlayerStateMachine(entity)
};