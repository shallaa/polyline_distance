(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MAP_MODE = require('./constants/map-mode.json');

var keys = require('./config/keys.json');
var maps = require('./core/maps');

var mode = MAP_MODE.DEFAULT;

var currentItem;
var currentLatLng;

var map;
var btnMeasure, btnClear;

var init = function(status){
  if(status.success){
    initMap();
    initControl();
  }else{
    document.getElementById('map').innerHTML = status.message;
  }
};

var initMap = function(){
  map = new maps.Map(document.getElementById('map'), {
    center: { lat: 37.3594556, lng: 127.103126 },
    zoom: 15,
    draggableCursor: 'default',
    zoomControl: true,
    zoomControlOptions: {
      position: maps.$('ControlPosition').RIGHT_TOP
    },
    scaleControl: false,
    streetViewControl: false,
    disableDoubleClickZoom: true
  });

  document.addEventListener('touchmove', function(event){ event.preventDefault(); }, false);
};

var initControl = function(){
  var makeControlButton = function(label){
    var div = document.createElement('div');

    div.className = 'control-button';
    div.innerHTML = label;

    return div;
  };

  btnMeasure = makeControlButton('거리재기');
  btnClear = makeControlButton('지우기');

  btnMeasure.addEventListener('click', onClickControlMeasure, false);
  btnClear.addEventListener('click', onClickControlClear, false);

  map.addControl(btnMeasure, maps.$('ControlPosition').RIGHT_TOP);
  map.addControl(btnClear, maps.$('ControlPosition').RIGHT_TOP);
};

var initModeMeasure = function(){
  mode = MAP_MODE.MEASURE;

  btnMeasure.className += ' selected';

  map.setCursor('pointer');
  map.setDraggable(false);

  map.addEventListener('mousemove', onMouseMoveMap);
  map.addEventListener('mousedown', onMouseDownMap);
  map.addEventListener('mouseup', onMouseUpMap);
  map.addEventListener('rightclick', onRightClickMap);
};

var initModeDefault = function(){
  mode = MAP_MODE.DEFAULT;

  btnMeasure.className = btnMeasure.className.replace(' selected', '');

  if(currentItem){
    currentItem.completeEdit();
    currentItem = null;
  }

  map.setCursor('default');
  map.setDraggable(true);

  map.removeEventListener('mousemove', onMouseMoveMap);
  map.removeEventListener('mousedown', onMouseDownMap);
  map.removeEventListener('mouseup', onMouseUpMap);
  map.removeEventListener('rightclick', onRightClickMap);
};

var onClickControlMeasure = function(event){
  event.preventDefault();

  if(mode == MAP_MODE.MEASURE){
    initModeDefault();
  }else{
    initModeMeasure();
  }
};

var onClickControlClear = function(event){
  event.preventDefault();

  map.removeChildAll();

  currentItem = null;

  initModeDefault();
};

var onMouseMoveMap = function(event){
  currentLatLng = event.latLng;
};

var onMouseDownMap = function(event){
  currentLatLng = event.latLng;
};

var onMouseUpMap = function(event){
  currentLatLng = event.latLng;

  if(!currentItem){
    currentItem = new maps.Item(currentLatLng);

    currentItem.addEventListener('removeSelected', function(){
      map.removeChild(this);
    }, currentItem);

    map.addChild(currentItem);

    updateCurrentItem();
  }

  currentItem.addPosition(currentLatLng);
};

var onRightClickMap = function(){
  if(currentItem){
    currentItem.addPosition(currentLatLng);

    initModeDefault();
  }
};

var updateCurrentItem = function(){
  if(currentItem){
    currentItem.updateAim(currentLatLng);

    requestAnimFrame(updateCurrentItem);
  }
};

maps(keys.API, init);
},{"./config/keys.json":2,"./constants/map-mode.json":3,"./core/maps":4}],2:[function(require,module,exports){
module.exports={
  "API": "AIzaSyDeyZVdO87BXvroGe_yP-fXNU_VxdQTFok"
}
},{}],3:[function(require,module,exports){
module.exports={
  "DEFAULT": "DEFAULT",
  "MEASURE": "MEASURE"
}
},{}],4:[function(require,module,exports){
// polyfill
window['requestAnimFrame'] = (function(){
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback){
      window.setTimeout(callback, 16);
    };
})();

var KEY, MAPS;

var queue = [];
var status;

var maps = function(key, func){
  func ? (KEY = key) : (func = key);
  queue ? (queue[queue.length] = func) : func(status);
};

var fn = function(key, value){
  maps[key] = value;
};

var wait = setInterval(function(){
  switch(document.readyState){
    case 'complete':
    case 'loaded': break;
    default: return;
  }

  clearInterval(wait);

  var script = document.createElement('script');

  var init = function(){
    MAPS = google.maps;

    fn('$', function(key){
      return MAPS[key];
    });

    fn('Map', require('../view/map')(MAPS));
    fn('Item', require('../view/item')(MAPS));

    status = { success: true };

    start();
  };

  var start = function(){
    var temp = queue, index = 0, count = temp.length;
    queue = null;

    while(index < count){
      temp[index++](status);
    }
  };

  // IE8 이하 또는 호환성 보기 설정
  if(!document.createElement('canvas').getContext){
    status = { success: false, message: '지원하지 않는 브라우저' };

    start();

    return;
  }

  document.getElementsByTagName('head')[0].appendChild(script);

  script.type = 'text/javascript';
  script.onload = init;
  script.src = 'https://maps.googleapis.com/maps/api/js?key=' + KEY;
}, 1);


module.exports = maps;
},{"../view/item":6,"../view/map":7}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
var EventDispatcher = require('../event/event-dispatcher');

var itemIndex = 0;

var DEFAULT_OPTION_POLYLINE = {
  strokeColor: '#FF0000',
  strokeOpacity: 1.0,
  strokeWeight: 3,
  clickable: false,
  draggable: false,
  editable: false
};

var distance = function(from, to){
  var R = 6371;
  var lat1 = from.lat() * Math.PI / 180;
  var lat2 = to.lat() * Math.PI / 180;
  var lon1 = from.lng() * Math.PI / 180;
  var lon2 = to.lng() * Math.PI / 180;

  var d = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * R;

  var factor = Math.pow(10, 2);
  var increment = 5 / (factor * 10);

  return Math.floor((d + increment) * factor) / factor;
};

module.exports = function(MAPS){
  var Item, fn;

  Item = function(latLng){
    this.constructor.call(this);

    this.latLngs = [];

    this.polyline = new MAPS.Polyline(DEFAULT_OPTION_POLYLINE);
    this.path = this.polyline.getPath();
    this.path.push(latLng);

    this.guidePolyline = new MAPS.Polyline(DEFAULT_OPTION_POLYLINE);
    this.guidePath = this.guidePolyline.getPath();
    this.guidePath.push(latLng);
    this.guidePath.push(latLng);

    this.map = null;
    this.marker = null;
    this.infoWindow = null;

    this.markerHandler = null;
    this.infoWindowHandler = null;
  };

  fn = Item.prototype = new EventDispatcher;

  fn.addPosition = function(latLng){
    this.latLngs.push(latLng);
    this.path.push(latLng);

    this.guidePath.setAt(0, latLng);
  };

  fn.updateAim = function(latLng){
    this.guidePath.setAt(1, latLng);
  };

  fn.completeEdit = function(){
    var isInfoOpen = true;
    var _this = this;

    this.marker = new MAPS.Marker({
      position: this.latLngs[this.latLngs.length - 1]
    });

    this.infoWindow = new MAPS.InfoWindow({
      content: this.getDistance()
    });

    this.markerHandler = MAPS.event.addListener(this.marker, 'click', function(){
      isInfoOpen = !isInfoOpen;

      if(isInfoOpen){
        _this.infoWindow.setZIndex(++itemIndex);
        _this.infoWindow.open(_this.map, _this.marker);
      }else{
        _this.infoWindow.close();
      }
    });

    this.infoWindowHandler = MAPS.event.addListener(this.infoWindow, 'closeclick', function(){
      _this.dispatchEvent('removeSelected');
    });

    this.marker.setZIndex(++itemIndex);
    this.infoWindow.setZIndex(++itemIndex);

    this.marker.setMap(this.map);
    this.infoWindow.open(this.map, this.marker);

    this.guidePolyline.setMap(null);
  };

  fn.getDistance = function(){
    var index = 0, count = this.latLngs.length - 1;
    var dist = 0;

    for( ; index < count; index++){
      dist += distance(this.latLngs[index], this.latLngs[index + 1]);
    }

    if(dist < 1){
      dist = (dist * 1000).toFixed(2) + 'm';
    }else{
      dist = dist.toFixed(2) + 'km';
    }

    return dist;
  };

  fn.addTo = function(map){
    this.map = map;

    this.polyline.setMap(map);
    this.guidePolyline.setMap(map);
  };

  fn.remove = function(){
    this.polyline.setMap(null);
    this.guidePolyline.setMap(null);

    this.polyline = null;
    this.guidePolyline = null;

    if(this.marker){
      this.markerHandler.remove();
      this.marker.setMap(null);
      this.marker = null;
    }

    if(this.infoWindow){
      this.infoWindowHandler.remove();
      this.infoWindow.close();
      this.infoWindow = null;
    }
  };

  return Item;
};
},{"../event/event-dispatcher":5}],7:[function(require,module,exports){
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
},{}]},{},[1]);

//# sourceMappingURL=app.js.map
