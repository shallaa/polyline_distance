var EventDispatcher;
var fn;

EventDispatcher = function(){
  this.events = {};
};

fn = EventDispatcher.prototype;

fn.addEventListener = function(type, listener, context){
  if(!this.events[type]) this.events[type] = {};

  this.events[type][listener] = { listener: listener, context: context || this };
};

fn.removeEventListener = function(type, listener){
  if(listener){
    delete this.events[type][listener];
  }else{
    delete this.events[type];
  }
};

fn.dispatchEvent = function(type, data){
  var listeners = this.events[type];
  var key, listener;

  for(key in listeners){
    listener = listeners[key];

    listener.listener.call(listener.context, { type: type, data: data });
  }
};

module.exports = EventDispatcher;