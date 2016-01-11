var express = require('express');
var morgan = require('morgan');

var app = express();

app.use(morgan('dev'));
app.use(express.static('dist'));

var server = app.listen(process.env.PORT || 3000, function(){
  console.log('Start server on %d', server.address().port);
});