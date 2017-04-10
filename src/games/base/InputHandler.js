/**
 * Created by guglielmo on 30/03/17.
 */
//GUI: input handler

window.cocos.cc.InputHandler = window.cocos.cc.Class.extend({
    _className: "InputHandler",
    keyboardCallbacks: null,
    mouseCallbacks: null,
    
    //GUI: default constructor
    ctor: function(){
        
    },

    registerForKeyboardEvents: function(node,keyPressedClbk, keyHoldClbk, keyReleasedClbk){
        console.log("registering for keyboard events");
        if ('keyboard' in window.cocos.cc.sys.capabilities) {
            console.log("keyboard capabilities ok");
            //GUI: build a keyboardCallbacksStruct
            this.keyboardCallbacks = {
                keyPressureMap: {}, //GUI: keep a counter for each button pressed
                pressed: keyPressedClbk,
                hold: keyHoldClbk,
                released: keyReleasedClbk
            }

            var self = this;

            window.cocos.cc.eventManager.addListener({
                event: window.cocos.cc.EventListener.KEYBOARD,
                inputHandler:self, //GUI: give a reference to inputHandler
                onKeyPressed: function (key, event) {
                    this.inputHandler.onKeyPressed(key, event);
                },
                onKeyReleased: function (key, event) {
                    console.log("key released", key);
                    this.inputHandler.onKeyReleased(key, event);
                }
            }, node);
            console.log("keyboard listener registered");
            return true;
        }
    },

    registerForMouseEvents: function(node, mousePressedClbk, mouseHoldClbk, mouseReleasedClbk, mouseMovedClbk, mouseScrollClbk){

    },

    ////////////////////////////////////////////////////////////////////
    //GUI: handling keyboard events
    onKeyPressed: function (key, event) {
        //GUI: check if key was pressed and not holding (counter == 0 or null)
        var counter = this.keyboardCallbacks.keyPressureMap[key];
        if(counter === 'undefined' || counter == 0){
            this.keyboardCallbacks.keyPressureMap[key] = 1;
            if(this.keyboardCallbacks.pressed != null){
                console.log("key pressed", key);
                this.keyboardCallbacks.pressed(key,event);
            }
        }else{
            this.keyboardCallbacks.keyPressureMap[key]++
            if(this.keyboardCallbacks.hold != null){
                console.log("key holded", key);
                this.keyboardCallbacks.hold(key,event);
            }
        }

    },

    onKeyReleased: function (key, event) {
        this.keyboardCallbacks.keyPressureMap[key] = 0;
        if(this.keyboardCallbacks.released != null){
            this.keyboardCallbacks.released(key,event);
        }
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


window.cocos.cc.InputHandler.create =  function(){
    return new window.cocos.cc.InputHandler();
}