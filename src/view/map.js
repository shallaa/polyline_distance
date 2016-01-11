module.exports = function(MAPS){
  var Map, fn;

  Map = function(el, options){
    this.events = {};
    this.children = [];

    this.map = new MAPS.Map(el, options);
  };

  fn = Map.prototype;

  fn.addControl = function(el, position){
    this.map.controls[position].push(el);
  };

  fn.addChild = function(){
    var index = 0, count = arguments.length;
    var child;

    for(; index < count; index++){
      child = arguments[index];

      child.addTo(this.map);
      this.children.push(child);
    }
  };

  fn.removeChild = function(){
    var index = 0, count = arguments.length;
    var childIndex;

    for(; index < count; index++){
      if((childIndex = this.children.indexOf(arguments[index])) != -1){
        this.children.splice(childIndex, 1)[0].remove();
      }
    }
  };

  fn.removeChildAll = function(){
    var index = 0, count = this.children.length;

    for( ; index < count; index++){
      this.children[index].remove();
    }

    this.children.length = 0;
  };

  fn.addEventListener = function(type, listener){
    if(!this.events[type]) this.events[type] = {};

    this.events[type][listener] = MAPS.event.addListener(this.map, type, listener);
  };

  fn.removeEventListener = function(type, listener){
    if(listener){
      this.events[type][listener].remove();
    }else{
      for(listener in this.events[type]){
        this.events[type][listener].remove();
      }
    }
  };

  fn.setCursor = function(type){
    this.map.setOptions({ draggableCursor: type });
  };

  fn.setDraggable = function(value){
    this.map.setOptions({ draggable: value });
  };

  return Map;
};