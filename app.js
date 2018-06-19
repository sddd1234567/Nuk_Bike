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
var bikePos = {};

var ranges = 
{
    management:
    {
        minLat: 22.732822,
        minLong: 120.287543,
        maxLat: 22.732738,
        maxLong: 120.288540
    },
    law:
    {
        minLat: 22.732497,
        minLong: 120.286458,
        maxLat: 22.733294,
        maxLong: 120.287482 
    },
    library:
    {
        minLat: 22.733849,
        minLong: 120.285397,
        maxLat: 22.734652,
        maxLong: 120.285690
    },
    science:
    {
        minLat: 22.735266,
        minLong: 120.285403,
        maxLat: 22.736107,
        maxLong: 120.286824
    },
    admin:
    {
        minLat: 22.734160,
        minLong: 120.283682,
        maxLat: 22.734784,
        maxLong: 120.284251
    },
    social:
    {
        minLat: 22.735066,
        minLong: 120.280751,
        maxLat: 22.736242,
        maxLong: 120.282511
    },
    dorm1:
    {
        minLat: 22.735442,
        minLong: 120.277899,
        maxLat: 22.735638,
        maxLong: 120.278942
    },
    dorm2:
    {
        minLat: 22.735617,
        minLong: 120.277840,
        maxLat: 22.736052,
        maxLong: 120.279045


    },
    health:
    {
        minLat: 22.734185,
        minLong: 120.277423,
        maxLat: 22.734843,
        maxLong: 120.278721
    },
    engineer:
    {
        minLat: 22.732042,
        minLong: 120.276376,
        maxLat: 22.733234,
        maxLong: 120.277181
    },
    complex:
    {
        minLat: 22.731770,
        minLong: 120.276601,
        maxLat: 22.732576,
        maxLong: 120.277932
    }
}

var dic = 
{
        "management": "管理學院",
        "law": "法學院",
        "library": "圖書資訊大樓",
        "science": "理學院",
        "admin": "行政大樓",
        "complex": "綜合大樓",
        "engineer": "工學院",
        "health": "運健休大樓",
        "social": "人文社會科學院",
        "dorm1": "學生宿舍1",
        "dorm2": "學生宿舍2"
}


app.get('/', function (req, res) {
    // vector = [22.734229, 120.285300];
    var bikes = {};
    for(index in bikePos)
    {
        var verticalPos = ((bikePos[index].vector[0] - zeroVector[0]) / height[0]) * 705 - ((bikePos[index].vector[1] - zeroVector[1]) / width[1]) * width[0] * 705;
        var horizontalPos = ((bikePos[index].vector[1] - zeroVector[1]) / width[1]) * 1000 + ((bikePos[index].vector[0] - zeroVector[0]) / height[0]) * height[1] * 1000;
        console.log(((bikePos[index].vector[0] - zeroVector[0]) / height[0]) * height[1] * 1000);
        console.log(horizontalPos);
        bikes[index] = [verticalPos - 21, horizontalPos - 25];
    }
    console.log(bikes);
    res.render('index', { title: 'ㄏㄏ', content: '<h2>hello</h2>', vector: bikes, jsonMessage: bikePos, dic: dic });
})

client.on('connect', function () {
    client.subscribe('GPS');
})

client.on('message', function (topic, message) {
    // message is Buffer
    var jsonMessage = JSON.parse(message);
    console.log(jsonMessage.lat);
    var region = CheckInRange([jsonMessage.lat, jsonMessage.long]);
    bikePos[jsonMessage.id] =
    {
        region: region,
        vector: [jsonMessage.lat, jsonMessage.long]
    } 
    // vector[0] = jsonMessage.lat;
    // vector[1] = jsonMessage.long;
});

function CheckRange(vector, targetRange)
{
    console.log("targetRange: " + targetRange.maxLong);
    console.log("vector:" + vector);
    if (vector[0] >= targetRange.minLat && vector[0] <= targetRange.maxLat && vector[1] >= targetRange.minLong && vector[1] <= targetRange.maxLong)
        return true;
    else
        return false;
}

function CheckInRange(vector)
{
    for(index in ranges)
    {
        if(index == "dorm1")
            console.log(ranges[index].minLat + "___" + ranges[index].minLong + "__" + ranges[index].maxLat + "___" + ranges[index].maxLong);
        console.log(CheckRange(vector, ranges[index]))
        if(CheckRange(vector, ranges[index]))
            return index;
    }
    return "null";
}

function ClearData()
{
    bikePos = {};
    console.log("Clear");
}

setInterval(ClearData, 1000 * 60 * 15);

app.listen(port);