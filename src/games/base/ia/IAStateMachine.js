/**
 * Created by guglielmo on 09/04/17.
 */
window.cocos.cc.IAStateMachine = window.cocos.cc.Class.extend({
    _className: "IAStateMachine",
    //GUI: custom
    //GUI: reference to entity
    entity: null,
    //GUI: list of states
    states: null,
    currentState: null,
    nextState: null,
    changeStateFlag: false,

    ctor: function(entity){

        this.entity = entity;
        this.init();
    },

    init: function(){
        //GUI: init a standard set of behaviours
        this.states = {};
        this.initStates();
        this.currentState = null;
        this.nextState = null;
        this.changeStateFlag = false;
    },

    initStates: function(){

    },

    update: function(dt){
        if(this.currentState != null){
            this.currentState.update(dt);
        }
        //GUI: check if it has to change state
        if(this.changeStateFlag){
            this.changeStateFlag = false;
            if(this.currentState != null){
                this.currentState.onExit();
            }
            //GUI: activate new state
            this.currentState = this.nextState;
            this.currentState.onEnter();
            this.nextState = null;
        }
    },

    changeState: function(stateName, params){
        //GUI: change state at the end of this update cycle
        if(stateName != null) {
            var newState = this.states[stateName];
            if(newState){
                this.nextState = newState;
                newState.setEnterParams(params);
                this.changeStateFlag = true;
            }
        }
    },

    ////////////////////////////////////////////////////////////////////
    //GUI: events on movements
    onGroundTouched: function(entity){
        if(this.currentState != null){
            this.currentState.onGroundTouched(entity);
        }
    },

    onHitEvent: function(entity){
        if(this.currentState != null){
            this.currentState.onHitEvent(entity);
        }

    },

    onBorder: function(){
        if(this.currentState != null){
            this.currentState.onBorder();
        }
    }
});

window.cocos.cc.IAStateMachine.create = function (entity) {
    return new window.cocos.cc.IAStateMachine(entity);
};

window.cocos.cc.EnemyMaleStateMachine = window.cocos.cc.IAStateMachine.extend({
    _className: "EnemyMaleStateMachine",
    //GUI: custom
    ctor: function(entity){

        this.entity = entity;
        this.init();
    },

    initStates: function(){
        this._super();
        this.states[window.cocos.cc.kIAStateIdle] = window.cocos.cc.IAStateIdle.create();
        this.states[window.cocos.cc.kIAStateWalk] = window.cocos.cc.IAStateWalk.create();
        this.states[window.cocos.cc.kIAStateAttack] = window.cocos.cc.IAStateAttack.create();
        this.states[window.cocos.cc.kIAStateDeath] = window.cocos.cc.IAStateDeath.create();
        this.states[window.cocos.cc.kIAStateDead] = window.cocos.cc.IAStateDead.create();
        this.states[window.cocos.cc.kIAStateReborn] = window.cocos.cc.IAStateReborn.create();
        //GUI: set entity to states
        for(var key in this.states){
            this.states[key].setEntity(this.entity);
        }
    }
});

window.cocos.cc.EnemyMaleStateMachine.create = function(entity){
    return new window.cocos.cc.EnemyMaleStateMachine(entity)
};