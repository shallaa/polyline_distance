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