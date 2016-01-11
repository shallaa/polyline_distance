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