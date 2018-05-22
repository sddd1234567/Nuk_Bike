var express = require('express');
var app = express();
var engine = require('ejs-locals');
var path = require('path');
var port = Number(process.env.PORT || '80');
var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://140.127.225.210')
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs');

var zeroVector = [22.729154, 120.274736];
var height = [0.009787, -0.000835];
var width = [0.000764, 0.016639];
var vector = [0,0];
app.get('/', function (req, res) {
    // vector = [22.734229, 120.285300];
    var verticalPos = ((vector[0] - zeroVector[0]) / height[0]) * 705 - ((vector[1] - zeroVector[1]) / width[1]) * width[0] * 705;
    var horizontalPos = ((vector[1] - zeroVector[1]) / width[1]) * 1000 + ((vector[0] - zeroVector[0]) / height[0]) * height[1] * 1000;
    console.log(((vector[0] - zeroVector[0]) / height[0]) * height[1] * 1000);
    console.log(horizontalPos);
    res.render('index', { title: 'ㄏㄏ', content: '<h2>hello</h2>', list: ['mark', 'tom'], vector:[verticalPos-21,horizontalPos-25], jsonMessage: vector });
})

client.on('connect', function () {
    client.subscribe('nukbike');
})

client.on('message', function (topic, message) {
    // message is Buffer
    var jsonMessage = JSON.parse(message);
    console.log(jsonMessage.lat);
    vector[0] = jsonMessage.lat;
    vector[1] = jsonMessage.long;
})

app.listen(port);