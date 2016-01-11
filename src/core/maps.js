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