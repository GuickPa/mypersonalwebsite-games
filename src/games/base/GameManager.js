/**
 * Created by guglielmo on 11/04/17.
 */
//GUI: listeners for game event
window.cocos.cc.GameManagerEventListener = window.cocos.cc.Class.extend({
    _className: "GameManagerEventListener",    
    target: null,
    callback: null,

    ctor: function(eventName, target, callback){
        this.eventName = eventName;
        this.target = target;
        this.callback = callback;
    }
});

window.cocos.cc.GameManagerEventListener.create = function(eventName, target, callback){
    return new window.cocos.cc.GameManagerEventListener(eventName, target, callback);
}

//GUI: game event
window.cocos.cc.GameManagerEvent = window.cocos.cc.Class.extend({
    _className: "GameManagerEvent",
    eventName: null,
    listeners: null,

    ctor: function(eventName){
        this.eventName = eventName;
        this.listeners = [];
    },

    broadcast: function(params){
        //GUI: broadcast this event to all the listeners
        for(var i = 0; i < this.listeners.length; i++){
            var lt = this.listeners[i];
            //GUI: make the listener to call its own callback
            lt.callback.call(lt.target, this.eventName, params);
        }
    },

    addListener: function(object, callback){
        if(object){
            //GUI: add custom value to listener. this to avoid multiple adding of the same listener to this event
            if(object.gameListenerID == null || typeof  object.gameListenerID === 'undefined'){
                //GUI: create the custom value
                object.gameListenerID = new Date().getTime();
                //GUI: create the listener struct
                var listener = window.cocos.cc.GameManagerEventListener.create(this.eventName, object, callback);
                this.listeners.push(listener);
                return true;
            }
            //GUI: check if listener has the id for this event
            else{
                //GUI: if listener wasn't already added
                if(this.getListenerIndex(object)){
                    var listener = window.cocos.cc.GameManagerEventListener.create(this.eventName, object, callback);
                    this.listeners.push(listener);
                    return true;
                }
            }
        }
        return false;
    },

    getListenerIndex: function(object){
        var find = function(objElement, index, array){
            return objElement.gameListenerID == array[index].target.gameListenerID;
        };

        var index = this.listeners.find(object);
        return (typeof index !== 'undefined') ? index : -1;
    },
    
    removeListener: function(object){
        var index = this.getListenerIndex(object);
        if(index >= 0){
            this.listeners = this.listeners.splice(index, 1);
            return true;
        }

        return false;
    }
});

window.cocos.cc.GameManagerEvent.create = function(eventName){
    return new window.cocos.cc.GameManagerEvent(eventName);
}
//GUI: this is a base "abstract" class.
//Its purpose is to manage the game (UI, logic, etc) and handle custom events - each subclass will implements its own logic
window.cocos.cc.GameManager = window.cocos.cc.Class.extend({
    _className: "GameManager",
    //GUI: custom
    eventMaps: null,

    ctor: function(){
        this.init();
    },

    init: function(){
        this.eventMaps = {};        
    },

    //////////////////////////////////////////////////////////////////////
    //GUI: handles game events
    //GUI: params could be null
    broadcastEvent: function(eventName, params){
        if(this.eventMaps){
            var event = this.eventMaps[eventName];
            if(event != null){
                event.broadcast(params);
                return true;
            }
        }

        return false;
    },

    addListenerForEvent: function(eventName, object, callback){
        if(this.eventMaps){
            var event = this.eventMaps[eventName];
            if(event == null){
                event = window.cocos.cc.GameManagerEvent.create(eventName);
                this.eventMaps[eventName] = event;
            }

            event.addListener(object, callback);
        }
    },

    removeListenerForEvent: function(eventName, object){
        if(this.eventMaps){
            var event = this.eventMaps[eventName];
            if(event != null){
                event = window.cocos.cc.GameManagerEvent.create(eventName);
                return event.removeListener(object);
            }
        }
    }
});

window.cocos.cc.GameManager.create = function(){
    return new window.cocos.cc.GameManager();
}

//GUI: commons events
window.cocos.cc.GameManagerEvents = {
    kGameManagerEventGameStarted: "gameStarted",
    kGameManagerEventGamePaused: "gamePaused",
    kGameManagerEventGameResumed: "gameResumed",
    //GUI: player commons events
    kGameManagerEventPlayerDead: "playerDead"
};